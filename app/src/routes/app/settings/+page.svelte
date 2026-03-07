<script>
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Menubar from '$lib/components/ui/menubar/index.js';
	import { authClient } from '$lib/client/auth-client';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import * as InputOTP from '$lib/components/ui/input-otp/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as Item from '$lib/components/ui/item/index.js';
	import CirclePlus from '@lucide/svelte/icons/circle-plus';
	import { fly } from 'svelte/transition';

	import imageCompression from 'browser-image-compression';
	import AvatarSelector from '../AvatarSelector.svelte';

	import { getInitials } from '$lib/utils.js';
	import { goto, invalidate } from '$app/navigation';
	import z from 'zod';
	import { account } from '$lib/validators';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { env } from '$env/dynamic/public';
	import { resetPassword } from 'better-auth/api';
	import { user } from '$lib/client/state.svelte.js';

	const flyDown = {
		y: -10,
		duration: 400,
		opacity: 0
	};

	const passwordResetSchema = z
		.object({
			password: account.shape.password, // reuse password rules
			confirmPassword: z.string()
		})
		.superRefine((data, ctx) => {
			if (data.password !== data.confirmPassword) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['confirmPassword'], // show error on confirm field
					message: 'Passwords do not match'
				});
			}
		});

	// profile picture logic //

	let maxSizeMB = env.PUBLIC_MAX_AVATAR_SIZE_MB;
	let uploading = false;

	async function compressImage(file) {
		const options = {
			maxSizeMB,
			useWebWorker: true
		};

		const compressedBlob = await imageCompression(file, options);
		return compressedBlob;
	}

	async function uploadProfilePicture(croppie) {
		if (uploading) {
			toast('Uploading profile picture...', { duration: 2000 });
			return;
		}
		uploading = true;

		let blob = await croppie.result({
			type: 'blob', // return a Blob
			size: { width: 256, height: 256 }, // final output size in pixels
			format: 'png', // 'png'
			quality: 1 // 0–1, only for jpeg/webp
		});

		blob = await compressImage(blob);

		try {
			const r1 = await fetch(`/s3/user/avatar/${user.current.id}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const { url, fields } = await r1.json();

			const formData = new FormData();
			for (const [k, v] of Object.entries(fields)) {
				formData.append(k, v);
			}
			formData.append('file', blob);

			const res = await fetch(url, {
				method: 'POST',
				body: formData
			});

			if (!res.ok) {
				const text = await res.text().catch(() => '');
				throw new Error(`Upload failed: ${res.status} ${text}`);
			}

			toast.success('Profile picture updated successfully! Reload page to see changes.');
			profilePicDialogOpen = false;
		} catch (err) {
			message = err?.message ?? 'Upload error';
			toast.error(message);
		} finally {
			uploading = false;
		}
	}

	// end of profile picture logic//

	let accountChanges = $state({ name: false, email: false, password: false });
	let accountForm = $state({ email: '', password: '', name: '' });
	let accountError = $state({});
	let accountExtra = $state({ currentPassword: '', confirmPassword: '' });
	let accountExtraError = $state({});

	async function validateAccount(field = null) {
		if (field) accountChanges[field] = true;

		if (accountExtra.confirmPassword !== accountForm.password)
			accountExtraError.confirmPassword = 'Passwords do not match';
		else accountExtraError = {};

		const r = account.safeParse(accountForm);
		if (!r.success) accountError = r.error.flatten();
		else accountError = {};
	}

	async function saveAccountChanges() {
		if (accountChanges.name && !accountError?.fieldErrors?.name) {
			accountChanges.name = false;

			const res = await authClient.updateUser({
				name: accountForm.name
			});

			if (res.error) {
				toast.error(res.error.message);
				return;
			} else {
				toast.success('Name updated successfully');
			}
		}
		if (accountChanges.email && !accountError?.fieldErrors?.email) {
			accountChanges.email = false;

			const res = await authClient.changeEmail({
				newEmail: accountForm.email,
				callbackURL: `${window.location.origin}/app/settings`
			});

			if (res.error) {
				toast.error(res.error.message);
				return;
			} else {
				toast.success(
					'Verification email sent to new email address. Please verify to complete the change.'
				);
			}
		}
		if (
			accountChanges.password &&
			!accountError?.fieldErrors?.password &&
			!accountExtraError.confirmPassword &&
			accountExtra.currentPassword.length > 0
		) {
			accountChanges.password = false;

			const res = await authClient.changePassword({
				currentPassword: accountExtra.currentPassword,
				newPassword: accountForm.password
			});

			if (res.error) {
				toast.error(res.error.message);
				return;
			} else {
				toast.success('Password updated successfully');
			}
		}

		await invalidate('app:auth');
	}

	let passwordResetOpen = $state(false);
	let passwordResetState = $state('otp'); // 'otp' | 'reset'
	let otpSent = $state(false);
	let otpError = $state({});
	let otpPasswordResetCode = $state('');
	$effect(async () => {
		if (otpPasswordResetCode.length === 6) await otpRecoverHandle();
	});
	let passwordResetForm = $state({ password: '', confirmPassword: '' });
	let passwordResetError = $state({});

	async function otpRecoverSend() {
		await authClient.emailOtp.sendVerificationOtp({
			email: user.current.email,
			type: 'forget-password'
		});
		toast.info('Verification code sent');
	}

	async function otpRecoverHandle() {
		const { data, error } = await authClient.emailOtp.checkVerificationOtp({
			email: user.current.email,
			type: 'forget-password',
			otp: otpPasswordResetCode
		});

		if (error) {
			toast.error(`Error verifying code: ${error.message}`);
		} else {
			toast.success('Code verified successfully');
			passwordResetState = 'reset';
		}
	}

	async function validatePasswordReset() {
		const r = passwordResetSchema.safeParse(passwordResetForm);
		if (!r.success) passwordResetError = z.flattenError(r.error);
		else passwordResetError = {};
	}

	async function passwordReset() {
		if (Object.keys(passwordResetError).length > 0) {
			toast.error('Please fix the errors in the form');
			return;
		}

		const { data, error } = await authClient.emailOtp.resetPassword({
			email: user.current.email,
			otp: otpPasswordResetCode,
			password: passwordResetForm.password
		});

		if (error) {
			toast.error(`Error resetting password: ${error.message}`);
		} else {
			toast.success('Password reset successfully');
			passwordResetState = 'otp';
			passwordResetOpen = false;
			otpPasswordResetCode = '';
			passwordResetForm = { password: '', confirmPassword: '' };
		}
	}

	let deletionForm = $state({ password: '' });
	let deletionError = $state('');

	async function deleteAccount() {
		const r = await authClient.deleteUser({ password: deletionForm.password });
		console.log(r);

		if (r.error) {
			deletionError = r.error.message;
			return;
		}

		await invalidate('app:auth');
		goto('/');
	}

	async function connectProvider(provider) {
		const { error } = await authClient.linkSocial({
			provider: provider,
			callbackURL: '/app/settings'
		});

		if (error) {
			toast.error(`Error connecting ${provider}: ${error.message}`);
		} else {
			toast.success(`${provider} connected successfully`);
		}
	}

	async function disconnectProvider(provider) {
		const { error } = await authClient.unlinkAccount({
			providerId: provider
		});

		if (error) {
			toast.error(`Error unlinking ${provider}: ${error.message}`);
		} else {
			toast.success(`${provider} unlinked successfully`);
		}
	}

	let linkedAccounts = $state([]);

	onMount(async () => {
		accountForm = {
			name: user.current.name,
			email: user.current.email
		};

		const r = await authClient.listAccounts();
		if (!r.error && r.data?.length > 0)
			linkedAccounts = r.data.filter((x) => x.providerId !== 'credentials');
		else linkedAccounts = [];
	});
</script>

<main class="container flex flex-col items-center gap-6 p-6">
	<Card.Root class="my-4 w-full max-w-3xl">
		<Card.Content class="flex flex-col gap-3">
			<h3 class="scroll-m-20 text-2xl font-semibold tracking-tight" id="account">Account</h3>
			<Separator class="mt-0 mb-4" />

			<div class="flex gap-4">
				<div class="relative w-fit">
					<AvatarSelector title="Upload Profile Picture" onSubmit={uploadProfilePicture}>
						{#snippet trigger()}
							<Avatar.Root class="size-40 cursor-pointer rounded-lg">
								{#if user.current.id}
									<Avatar.Image src={'/s3/user/avatar/' + user.current.id} />
								{/if}
								<Avatar.Fallback class="rounded-lg"
									>{getInitials(user.current.name ?? 'User Name')}</Avatar.Fallback
								>
							</Avatar.Root>
							<div
								class="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-md bg-background"
							>
								<CirclePlus class="cursor-pointer shadow" size="16" />
							</div>
						{/snippet}
					</AvatarSelector>
				</div>

				<div class="flex flex-1 flex-col">
					<Label>Name</Label>
					<Input
						bind:value={accountForm.name}
						oninput={() => validateAccount('name')}
						type="text"
						class="mt-1.5"
					/>
					<div class="relative mt-1.5">
						{#if accountError?.fieldErrors?.name && accountForm.name.length > 0}
							<div transition:fly={flyDown}>
								<Label class="absolute text-red-500">
									{accountError?.fieldErrors?.name}
								</Label>
							</div>
						{/if}
					</div>

					<Label class="mt-6">Email</Label>
					<Input
						bind:value={accountForm.email}
						oninput={() => validateAccount('email')}
						type="email"
						class="mt-1.5"
					/>
					<div class="relative mt-1.5">
						{#if accountError?.fieldErrors?.email && accountForm.email.length > 0}
							<div transition:fly={flyDown}>
								<Label class="absolute text-red-500">
									{accountError?.fieldErrors?.email}
								</Label>
							</div>
						{/if}
					</div>
				</div>
			</div>

			<div class="w-full">
				<div class="flex flex-1">
					<Label>Set New Password</Label>
					<div class="ml-auto">
						<Dialog.Root bind:open={passwordResetOpen}>
							<Dialog.Trigger>
								<Button variant="ghost" class="mb-0 h-0 text-muted-foreground" size="sm"
									>Forgot password?</Button
								>
							</Dialog.Trigger>
							<Dialog.Content>
								<Dialog.Header>
									<Dialog.Title>Reset Password</Dialog.Title>
									<Dialog.Description>
										{#if passwordResetState === 'otp'}
											<div class="flex flex-col items-center gap-6">
												<div class="grid justify-items-center gap-2">
													<InputOTP.Root maxlength={6} bind:value={otpPasswordResetCode}>
														{#snippet children({ cells })}
															<InputOTP.Group>
																{#each cells.slice(0, 3) as cell}
																	<InputOTP.Slot {cell} />
																{/each}
															</InputOTP.Group>
															<InputOTP.Separator />
															<InputOTP.Group>
																{#each cells.slice(3, 6) as cell}
																	<InputOTP.Slot {cell} />
																{/each}
															</InputOTP.Group>
														{/snippet}
													</InputOTP.Root>

													{#if otpError.message?.length > 0}
														<Label class="text-red-500">
															{otpError.message}
														</Label>
													{/if}

													{#if !otpSent}
														<Button class="w-full" variant="ghost" onclick={otpRecoverSend}
															>Send Code</Button
														>
													{:else}
														<Button class="w-full" variant="ghost" onclick={otpRecoverSend}
															>Send Code Again</Button
														>
													{/if}
												</div>
											</div>
										{:else if passwordResetState === 'reset'}
											<div class="flex flex-col gap-6">
												<div class="grid gap-2">
													<div class="grid gap-2">
														<Label>Password</Label>
														<Input
															bind:value={passwordResetForm.password}
															oninput={validatePasswordReset}
															type="password"
														/>
														{#if passwordResetError?.fieldErrors?.password && passwordResetForm.password.length > 0}
															<Label class="text-red-500">
																{passwordResetError.fieldErrors.password[0]}
															</Label>
														{/if}
													</div>

													<div class="grid gap-2">
														<Label>Confirm Password</Label>
														<Input
															bind:value={passwordResetForm.confirmPassword}
															oninput={validatePasswordReset}
															type="password"
														/>
														{#if passwordResetError?.fieldErrors?.confirmPassword && passwordResetForm.confirmPassword.length > 0}
															<Label class="text-red-500">
																{passwordResetError.fieldErrors.confirmPassword[0]}
															</Label>
														{/if}
													</div>
												</div>
											</div>
										{/if}
									</Dialog.Description>
								</Dialog.Header>
								<Dialog.Footer class="sm:justify-start">
									<Dialog.Close class={buttonVariants({ variant: 'secondary' })}>Close</Dialog.Close
									>
									{#if passwordResetState === 'otp'}
										<Button variant="outline" class="ml-auto" onclick={otpRecoverHandle}
											>Verify Code</Button
										>
									{:else if passwordResetState === 'reset'}
										<Button variant="outline" class="ml-auto" onclick={passwordReset}
											>Reset Password</Button
										>
									{/if}
								</Dialog.Footer>
							</Dialog.Content>
						</Dialog.Root>
					</div>
				</div>
				<Input
					class="mt-1.5"
					bind:value={accountForm.password}
					type="password"
					oninput={() => validateAccount('password')}
				/>
				<div class="relative mt-1.5">
					{#if accountError?.fieldErrors?.password && accountForm?.password?.length > 0}
						<div transition:fly={flyDown}>
							<Label class="absolute text-red-500">
								{accountError?.fieldErrors?.password}
							</Label>
						</div>
					{/if}
				</div>

				{#if accountForm.password?.length > 0}
					<div class="flex flex-col gap-0" transition:fly={flyDown}>
						<Label class="mt-7">Confirm Password</Label>
						<Input
							class="mt-2"
							bind:value={accountExtra.confirmPassword}
							type="password"
							oninput={() => validateAccount('password')}
						/>

						<div class="relative mt-1.5">
							{#if accountExtraError.confirmPassword && accountExtra.confirmPassword.length > 0}
								<div transition:fly={flyDown}>
									<Label class="absolute text-red-500">
										{accountExtraError.confirmPassword}
									</Label>
								</div>
							{/if}
						</div>

						<Label class="mt-7">Current Password</Label>
						<Input
							class="mt-2"
							bind:value={accountExtra.currentPassword}
							type="password"
							oninput={() => validateAccount('password')}
						/>
						<div class="relative mt-2">
							{#if accountExtraError.currentPassword && accountExtra.currentPassword.length > 0}
								<div transition:fly={flyDown}>
									<Label class="absolute text-red-500">
										{accountExtraError.currentPassword}
									</Label>
								</div>
							{/if}
						</div>
					</div>
				{/if}

				<Button
					variant="outline"
					class="mt-6 w-full"
					onclick={saveAccountChanges}
					disabled={!Object.values(accountChanges).some((value) => value === true)}>Save</Button
				>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root class="my-4 w-full max-w-3xl">
		<Card.Content class="flex flex-col gap-4">
			<h3 class="scroll-m-20 text-2xl font-semibold tracking-tight" id="linked-accounts">
				Linked Accounts
			</h3>
			<Separator class="mt-0 mb-4" />

			<div class="flex flex-col gap-4">
				<Item.Root variant="outline">
					<Item.Content>
						<Item.Title>Google</Item.Title>
						<Item.Description>Used for sign-in.</Item.Description>
					</Item.Content>
					<Item.Actions>
						{#if linkedAccounts?.some((account) => account.providerId === 'google')}
							<Button variant="outline" size="sm" onclick={() => disconnectProvider('google')}
								>Unlink</Button
							>
						{:else}
							<Button variant="outline" size="sm" onclick={() => connectProvider('google')}
								>Link</Button
							>
						{/if}
					</Item.Actions>
				</Item.Root>

				<Item.Root variant="outline">
					<Item.Content>
						<Item.Title>Google</Item.Title>
						<Item.Description>Used for sign-in.</Item.Description>
					</Item.Content>
					<Item.Actions>
						{#if linkedAccounts?.some((account) => account.providerId === 'google')}
							<Button variant="outline" size="sm" onclick={() => disconnectProvider('google')}
								>Unlink</Button
							>
						{:else}
							<Button variant="outline" size="sm" onclick={() => connectProvider('google')}
								>Link</Button
							>
						{/if}
					</Item.Actions>
				</Item.Root>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root class="my-4 w-full max-w-3xl">
		<Card.Content class="flex flex-col gap-4">
			<h3 class="scroll-m-20 text-2xl font-semibold tracking-tight" id="billing">Billing</h3>
			<Separator class="mt-0 mb-4" />
		</Card.Content>
	</Card.Root>

	<Card.Root class="my-4 w-full max-w-3xl">
		<Card.Content class="flex flex-col gap-4">
			<h3 class="scroll-m-20 text-2xl font-semibold tracking-tight" id="notifications">
				Notifications
			</h3>
			<Separator class="mt-0 mb-4" />

			<div class="flex flex-col gap-2">
				<Item.Root variant="ghost">
					<Item.Content>
						<Item.Title>Marketing Emails</Item.Title>
						<Item.Description>We promise not to spam!</Item.Description>
					</Item.Content>
					<Item.Actions>
						<Checkbox checked class="h-6 w-6" />
					</Item.Actions>
				</Item.Root>

				<Item.Root variant="ghost">
					<Item.Content>
						<Item.Title>Billing Updates</Item.Title>
						<Item.Description>Get notified about billing-related changes.</Item.Description>
					</Item.Content>
					<Item.Actions>
						<Checkbox checked class="h-6 w-6" />
					</Item.Actions>
				</Item.Root>

				<Item.Root variant="ghost">
					<Item.Content>
						<Item.Title>Workspace Events</Item.Title>
						<Item.Description>Get notified about workspace-related events.</Item.Description>
					</Item.Content>
					<Item.Actions>
						<Checkbox checked class="h-6 w-6" />
					</Item.Actions>
				</Item.Root>
			</div>
			<Button variant="outline" class="">Save</Button>
		</Card.Content>
	</Card.Root>

	<Card.Root class="my-4 w-full max-w-3xl">
		<Card.Content class="flex flex-col gap-4">
			<h3 class="scroll-m-20 text-2xl font-semibold tracking-tight" id="danger-zone">
				Danger Zone
			</h3>
			<Separator class="mt-0 mb-4" />

			<Dialog.Root>
				<Dialog.Trigger>
					<Button variant="destructive" class="w-full" size="sm">Delete Account</Button>
				</Dialog.Trigger>
				<Dialog.Content>
					<Dialog.Header>
						<Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
						<Dialog.Description>
							<div class="grid gap-4">
								<span>
									Deleting your account is irreversible. All of your data will be permanently
									removed. Please type in your password to confirm that you want to proceed.
								</span>

								<div class="flex items-center">
									<Label>Password</Label>
								</div>
								<Input bind:value={deletionForm.password} type="password" />
								<Label class="text-red-500">
									{deletionError}
								</Label>
							</div>
						</Dialog.Description>
					</Dialog.Header>
					<Dialog.Footer class="sm:justify-start">
						<Dialog.Close class={buttonVariants({ variant: 'secondary' })}>Close</Dialog.Close>
						<Button variant="destructive" onclick={deleteAccount}>Delete Account</Button>
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Root>
		</Card.Content>
	</Card.Root>
</main>
