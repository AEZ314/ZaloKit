<script>
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import * as InputOTP from '$lib/components/ui/input-otp/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import bg from '$lib/images/bg.jpg';
	import { onMount } from 'svelte';
	import { authClient } from '$lib/client/auth-client';
	import z from 'zod';
	import { goto } from '$app/navigation';
	import { account } from '$lib/validators';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/stores';
	import { form } from '$app/server';
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

	let redirect = $page.url.searchParams.get('redirect');
	if (!redirect || !redirect.startsWith('/')) {
		redirect = '/app';
	}

	let mode = $page.url.searchParams.get('mode');
	if (
		mode !== 'login' &&
		mode !== 'register' &&
		mode !== 'verify-email' &&
		mode !== 'recover' &&
		mode !== 'recover-verify' &&
		mode !== 'recover-reset'
	)
		mode = 'login';
	let state = $state(mode);

	let loginForm = $state({ email: '', password: '' });

	let registerForm = $state({ email: '', password: '', name: '' });
	let registerError = $state({});
	let agreementAccepted = $state(true);
	let newsletterAccepted = $state(true);

	let recoverForm = $state({ email: '' });

	let otpEmail = $state('');
	let otpError = $state({});
	let otpEmailVerifyCode = $state('');
	let otpPasswordResetCode = $state('');

	let passwordResetForm = $state({ password: '', confirmPassword: '' });
	let passwordResetError = $state({});

	$effect(async () => {
		if (otpEmailVerifyCode.length === 6) await otpVerifyHandle();
	});
	$effect(async () => {
		if (otpPasswordResetCode.length === 6) await otpRecoverHandle();
	});

	async function validateRegister() {
		const r = account.safeParse(registerForm);
		if (!r.success) registerError = r.error.flatten();
		else registerError = {};
	}

	async function register() {
		if (Object.keys(registerError).length > 0) {
			toast.error('Please fix the errors in the form');
			return;
		}

		if (!agreementAccepted) {
			toast.error('You must accept the terms and conditions');
			return;
		}

		if (newsletterAccepted) {
			// implement
		}

		await authClient.signUp.email(registerForm, {
			onSuccess: async (ctx) => {
				toast.success('Successfully signed up');
				otpEmail = registerForm.email;
				await otpVerifySend();
				state = 'verify-email';
				toast.success('Please verify your email address');
			},
			onError: (ctx) => {
				toast.error('Error signing up: ' + r.error.message);
			}
		});
	}

	async function login() {
		await authClient.signIn.email(
			{
				...loginForm,
				rememberMe: true
			},
			{
				onSuccess: (ctx) => {
					toast.success('Successfully signed in');
					goto(redirect);
				},
				onError: (ctx) => {
					toast.error('Error signing in: ' + ctx.error.message);

					if (ctx.error.message.includes('Email not verified')) {
						otpEmail = loginForm.email;
						otpVerifySend();
						state = 'verify-email';
						toast.info('Please verify your email address');
					}
				}
			}
		);
	}

	async function recover() {
		otpEmail = recoverForm.email;
		await otpRecoverSend();
		state = 'recover-verify';
	}

	async function otpVerifySend() {
		await authClient.emailOtp.sendVerificationOtp({
			email: otpEmail,
			type: 'email-verification'
		});
		toast.info('Verification code sent');
	}

	async function otpRecoverSend() {
		await authClient.emailOtp.sendVerificationOtp({
			email: otpEmail,
			type: 'forget-password'
		});
		toast.info('Verification code sent');
	}

	async function otpVerifyHandle() {
		const { data, error } = await authClient.emailOtp.verifyEmail({
			email: otpEmail,
			otp: otpEmailVerifyCode
		});

		if (error) {
			otpError = { message: error.message };
			toast.error('Error verifying email');
		} else {
			toast.success('Email verified successfully');
			goto(redirect);
		}
	}

	async function otpRecoverHandle() {
		const { data, error } = await authClient.emailOtp.checkVerificationOtp({
			email: otpEmail,
			type: 'forget-password',
			otp: otpPasswordResetCode
		});

		if (error) {
			toast.error(`Error verifying code: ${error.message}`);
		} else {
			toast.success('Code verified successfully');
			state = 'recover-reset';
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
			email: otpEmail,
			otp: otpPasswordResetCode,
			password: passwordResetForm.password
		});

		if (error) {
			toast.error(`Error resetting password: ${error.message}`);
		} else {
			toast.success('Password reset successfully');
			state = 'login';
		}
	}

	async function google() {
		await authClient.signIn.social({
			provider: 'google'
		});
	}

	onMount(async () => {
		if (user.current) goto(redirect);
	});
</script>

<div class="fixed inset-0 -z-10">
	<img src={bg} class="h-full w-full object-cover" alt="" />
</div>

<div class="flex min-h-screen items-center justify-center">
	{#if state === 'login'}
		<Card.Root class="-my-4 w-full max-w-sm">
			<Card.Header>
				<Card.Title>Sign In</Card.Title>
				<Card.Description>Enter your email below to sign into your account</Card.Description>
				<Card.Action>
					<Button variant="link" onclick={() => (state = 'register')}>Sign Up</Button>
				</Card.Action>
			</Card.Header>
			<Card.Content>
				<div class="flex flex-col gap-6">
					<div class="grid gap-2">
						<Label>Email</Label>
						<Input bind:value={loginForm.email} type="email" placeholder="name@example.com" />
					</div>
					<div class="grid gap-2">
						<div class="flex items-center">
							<Label>Password</Label>
							<button
								onclick={() => (state = 'recover')}
								class="ms-auto inline-block text-sm underline-offset-4 hover:underline"
							>
								Forgot your password?
							</button>
						</div>
						<Input bind:value={loginForm.password} type="password" />
					</div>
				</div>
			</Card.Content>
			<Card.Footer class="flex-col gap-2">
				<Button class="w-full" onclick={login}>Sign In</Button>
				<Button class="w-full" onclick={google}>Sign In with Google</Button>
			</Card.Footer>
		</Card.Root>
	{:else if state === 'register'}
		<Card.Root class="-my-4 w-full max-w-sm">
			<Card.Header>
				<Card.Title>Sign Up</Card.Title>
				<Card.Description>Sign up with an email and password</Card.Description>
				<Card.Action>
					<Button variant="link" onclick={() => (state = 'login')}>Sign In</Button>
				</Card.Action>
			</Card.Header>
			<Card.Content>
				<div class="flex flex-col gap-6">
					<div class="grid gap-2">
						<Label>Name</Label>
						<Input
							bind:value={registerForm.name}
							oninput={validateRegister}
							type="text"
							placeholder="John Doe"
						/>
						{#if registerError?.fieldErrors?.name && registerForm.name.length > 0}
							<Label class="text-red-500">
								{registerError.fieldErrors.name[0]}
							</Label>
						{/if}
					</div>
					<div class="grid gap-2">
						<Label>Email</Label>
						<Input
							bind:value={registerForm.email}
							oninput={validateRegister}
							type="email"
							placeholder="john@example.com"
						/>
						{#if registerError?.fieldErrors?.email && registerForm.email.length > 0}
							<Label class="text-red-500">
								{registerError.fieldErrors.email[0]}
							</Label>
						{/if}
					</div>
					<div class="grid gap-2">
						<div class="flex items-center">
							<Label>Password</Label>
						</div>
						<Input bind:value={registerForm.password} oninput={validateRegister} type="password" />
						{#if registerError?.fieldErrors?.password && registerForm.password.length > 0}
							<Label class="text-red-500">
								{registerError.fieldErrors.password[0]}
							</Label>
						{/if}
					</div>

					<div class="grid gap-2">
						<div class="flex items-center gap-3">
							<Checkbox bind:checked={agreementAccepted} />
							<a href="/home/resources/Legal" class="text-sm underline-offset-4 hover:underline"
								>Accept terms and conditions</a
							>
						</div>
						<div class="flex items-center gap-3">
							<Checkbox bind:checked={newsletterAccepted} />
							<Label class="text-sm">Subscribe to newsletter</Label>
						</div>
					</div>
				</div>
			</Card.Content>
			<Card.Footer class="flex-col gap-2">
				<Button class="w-full" onclick={register}>Sign Up</Button>
			</Card.Footer>
		</Card.Root>
	{:else if state === 'verify-email'}
		<Card.Root class="-my-4 w-full max-w-sm">
			<Card.Header>
				<Card.Title>Verification</Card.Title>
				<Card.Description>Enter your verification code</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="flex flex-col items-center gap-6">
					<div class="grid justify-items-center gap-2">
						<InputOTP.Root maxlength={6} bind:value={otpEmailVerifyCode}>
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

						<Button class="w-full" variant="ghost" onclick={otpVerifySend}>receive new code</Button>
					</div>
				</div>
			</Card.Content>
			<Card.Footer class="flex-col gap-2">
				<Button class="w-full" onclick={otpVerifyHandle}>Submit</Button>
			</Card.Footer>
		</Card.Root>
	{:else if state === 'recover'}
		<Card.Root class="-my-4 w-full max-w-sm">
			<Card.Header>
				<Card.Title>Recover your account</Card.Title>
				<Card.Description>Enter your email below to reset your password</Card.Description>
				<Card.Action>
					<Button variant="link" onclick={() => (state = 'login')}>Sign In</Button>
				</Card.Action>
			</Card.Header>
			<Card.Content>
				<div class="flex flex-col gap-6">
					<div class="grid gap-2">
						<Label>Email</Label>
						<Input bind:value={recoverForm.email} type="email" placeholder="name@example.com" />
					</div>
				</div>
			</Card.Content>
			<Card.Footer class="flex-col gap-2">
				<Button class="w-full" onclick={recover}>Get Code</Button>
			</Card.Footer>
		</Card.Root>
	{:else if state === 'recover-verify'}
		<Card.Root class="-my-4 w-full max-w-sm">
			<Card.Header>
				<Card.Title>Verification</Card.Title>
				<Card.Description>Enter your verification code</Card.Description>
			</Card.Header>
			<Card.Content>
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
							<Button class="w-full" variant="ghost" onclick={otpRecoverSend}
								>receive new code</Button
							>
						{/if}
					</div>
				</div>
			</Card.Content>
			<Card.Footer class="flex-col gap-2">
				<Button class="w-full" onclick={otpRecoverHandle}>Submit</Button>
			</Card.Footer>
		</Card.Root>
	{:else if state === 'recover-reset'}
		<Card.Root class="-my-4 w-full max-w-sm">
			<Card.Header>
				<Card.Title>Password Reset</Card.Title>
				<Card.Description>Set a new password</Card.Description>
			</Card.Header>
			<Card.Content>
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
			</Card.Content>
			<Card.Footer class="flex-col gap-2">
				<Button class="w-full" onclick={passwordReset}>Reset Password</Button>
			</Card.Footer>
		</Card.Root>
	{/if}
</div>
