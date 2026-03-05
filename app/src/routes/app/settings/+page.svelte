<script>
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Menubar from '$lib/components/ui/menubar/index.js';
	import { authClient } from '$lib/client/auth-client';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import * as InputOTP from '$lib/components/ui/input-otp/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import CirclePlus from '@lucide/svelte/icons/circle-plus';
	import { fly } from 'svelte/transition';

	import 'croppie/croppie.css';
	import Croppie from 'croppie';
	import imageCompression from 'browser-image-compression';

	import { getInitials } from '$lib/utils.js';
	import { goto, invalidate } from '$app/navigation';
	import z from 'zod';
	import { account } from '$lib/validators';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { env } from '$env/dynamic/public';
	import { resetPassword } from 'better-auth/api';
	import { user } from '$lib/client/state.svelte.js';

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

	let profilePicDialogOpen = $state(false);
	$effect(() => {
		if (!profilePicDialogOpen) {
			// destroy croppie instance when dialog is closed
			if (croppie) {
				croppie.destroy();
				croppie = null;
			}
			file = null;
		}
	});
	let fileInputEl;
	let file = $state(null);
	let croppie;
	let croppieEl;
	let wrapperEl;
	let aspectRatio = 1;
	let maxSizeMB = env.PUBLIC_MAX_AVATAR_SIZE_MB;
	let uploading = false;

	async function onProfilePictureChange(e) {
		const input = e.currentTarget;
		file = input.files?.[0] ?? file;

		initCroppie();
	}

	async function initCroppie() {
		if (croppie) return; // already initialized

		const width = wrapperEl.clientWidth;
		const height = width / aspectRatio;

		croppie = new Croppie(croppieEl, {
			viewport: {
				width: width * 0.8,
				height: (width * 0.8) / aspectRatio,
				type: aspectRatio === 1 ? 'square' : 'square'
			},
			boundary: {
				width,
				height
			}
		});

		await croppie.bind({ url: URL.createObjectURL(file) });
	}

	async function compressImage(file) {
		const options = {
			maxSizeMB,
			useWebWorker: true
		};

		const compressedBlob = await imageCompression(file, options);
		return compressedBlob;
	}

	async function uploadProfilePicture(e) {
		if (!croppie || !file) return;
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

<input
	type="file"
	id="avatar-selector"
	accept="image/*"
	class="hidden"
	bind:this={fileInputEl}
	onchange={onProfilePictureChange}
/>

<main class="container flex flex-col items-start justify-start gap-6 p-6">
	<h3 class="scroll-m-20 text-2xl font-semibold tracking-tight" id="account">Account</h3>
	<div class="flex w-full flex-col gap-2">
		<div class="relative w-fit">
			<Dialog.Root bind:open={profilePicDialogOpen}>
				<Dialog.Trigger>
					<Avatar.Root class="size-14 cursor-pointer rounded-lg">
						{#if user.current.id}
							<Avatar.Image src={'/s3/user/avatar/' + user.current.id} />
						{/if}
						<Avatar.Fallback class="rounded-lg"
							>{getInitials(user.current.name ?? 'User Name')}</Avatar.Fallback
						>
					</Avatar.Root>
					<CirclePlus class="absolute -top-3 -right-3 cursor-pointer shadow" size="16" />
				</Dialog.Trigger>
				<Dialog.Content>
					<Dialog.Header>
						<Dialog.Title>Upload Profile Picture</Dialog.Title>
						<Dialog.Description>
							<div bind:this={wrapperEl} class="w-full">
								<div bind:this={croppieEl}></div>
							</div>
						</Dialog.Description>
					</Dialog.Header>
					<Dialog.Footer class="sm:justify-start">
						<Dialog.Close class={buttonVariants({ variant: 'ghost' })}>Cancel</Dialog.Close>
						<Button class="ml-auto" onclick={() => fileInputEl.click()}>Select Picture</Button>
						<Button variant="secondary" disabled={!file} onclick={uploadProfilePicture}
							>Continue</Button
						>
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Root>
		</div>

		<Label>Name</Label>
		<Input bind:value={accountForm.name} oninput={() => validateAccount('name')} type="text" />
		{#if accountError?.fieldErrors?.name && accountForm.name.length > 0}
			<Label class="text-red-500">
				{accountError?.fieldErrors?.name}
			</Label>
		{/if}

		<Label>Email</Label>
		<Input bind:value={accountForm.email} oninput={() => validateAccount('email')} type="email" />
		{#if accountError?.fieldErrors?.email && accountForm.email.length > 0}
			<Label class="text-red-500">
				{accountError?.fieldErrors?.email}
			</Label>
		{/if}

		<Label>Set New Password</Label>
		<Input
			bind:value={accountForm.password}
			type="password"
			oninput={() => validateAccount('password')}
		/>
		<Dialog.Root bind:open={passwordResetOpen}>
			<Dialog.Trigger>
				<Button variant="ghost" size="sm">Forgot password?</Button>
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
					<Dialog.Close class={buttonVariants({ variant: 'secondary' })}>Close</Dialog.Close>
					{#if passwordResetState === 'otp'}
						<Button variant="outline" class="ml-auto" onclick={otpRecoverHandle}>Verify Code</Button
						>
					{:else if passwordResetState === 'reset'}
						<Button variant="outline" class="ml-auto" onclick={passwordReset}>Reset Password</Button
						>
					{/if}
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
		{#if accountError?.fieldErrors?.password && accountForm?.password?.length > 0}
			<div
				transition:fly={{
					y: -20,
					duration: 400,
					opacity: 0
				}}
			>
				<Label class="text-red-500">
					{accountError?.fieldErrors?.password}
				</Label>
			</div>
		{/if}

		{#if accountForm.password?.length > 0}
			<div
				class="flex flex-col gap-2"
				transition:fly={{
					y: -20,
					duration: 400,
					opacity: 0
				}}
			>
				<Label>Confirm Password</Label>
				<Input
					bind:value={accountExtra.confirmPassword}
					type="password"
					oninput={() => validateAccount('password')}
				/>
				{#if accountExtraError.confirmPassword && accountExtra.confirmPassword.length > 0}
					<Label class="text-red-500">
						{accountExtraError.confirmPassword}
					</Label>
				{/if}

				<Label>Current Password</Label>
				<Input
					bind:value={accountExtra.currentPassword}
					type="password"
					oninput={() => validateAccount('password')}
				/>
				{#if accountExtraError.currentPassword && accountExtra.currentPassword.length > 0}
					<Label class="text-red-500">
						{accountExtraError.currentPassword}
					</Label>
				{/if}
			</div>
		{/if}
	</div>

	<Button
		variant="outline"
		class="ml-auto"
		onclick={saveAccountChanges}
		disabled={!Object.values(accountChanges).some((value) => value === true)}>Save</Button
	>

	<div class="w-full">
		<Separator class="my-4" />
		<h3 class="scroll-m-20 text-2xl font-semibold tracking-tight" id="linked-accounts">
			Linked Accounts
		</h3>
		<ul class="w-full">
			<li class="flex items-center justify-between rounded-md border p-4">
				<div class="flex items-center gap-4">
					<span class="font-medium">Google</span>
				</div>
				{#if linkedAccounts?.some((account) => account.providerId === 'google')}
					<Button variant="outline" size="sm" onclick={() => disconnectProvider('google')}
						>Unlink</Button
					>
				{:else}
					<Button variant="outline" size="sm" onclick={() => connectProvider('google')}>Link</Button
					>
				{/if}
			</li>
		</ul>
	</div>

	<h3 class="scroll-m-20 text-2xl font-semibold tracking-tight" id="billing">Billing</h3>

	<h3 class="scroll-m-20 text-2xl font-semibold tracking-tight" id="notifications">
		Notifications
	</h3>
	<div class="flex items-start gap-3">
		<Checkbox id="terms-2" checked />
		<div class="grid gap-2">
			<Label for="terms-2">Accept terms and conditions</Label>
			<p class="text-sm text-muted-foreground">
				By clicking this checkbox, you agree to the terms and conditions.
			</p>
		</div>
	</div>

	<Button variant="outline" class="ml-auto">Save</Button>

	<h3 class="scroll-m-20 text-2xl font-semibold tracking-tight" id="danger-zone">Danger Zone</h3>
	<Dialog.Root>
		<Dialog.Trigger>
			<Button variant="destructive" size="sm">Delete Account</Button>
		</Dialog.Trigger>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
				<Dialog.Description>
					<div class="grid gap-4">
						<span>
							Deleting your account is irreversible. All of your data will be permanently removed.
							Please type in your password to confirm that you want to proceed.
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
</main>
