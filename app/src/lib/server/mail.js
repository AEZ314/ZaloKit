import nodemailer from 'nodemailer';
import formData from 'form-data';
import Otp from '$lib/server/email-templates/OTP.svelte';
import Renderer from 'better-svelte-email/render';
import { PUBLIC_BASE_URL } from '$env/dynamic/public';
import { firstName } from '$lib/utils';

export const mailer = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.GMAIL_USER,
		pass: process.env.GMAIL_APP_PASSWORD
	}
});

// See this link for some sample email templates: https://better-svelte-email.konixy.fr/preview/demo-email?view=render
const { render } = new Renderer();

// Add: personalize the email with the user's first name if available
export async function sendVerificationEmail(email, otp, type) {
	let text;

	if (type === 'sign-in') {
		text = `Your sign in code is ${otp}`;
	} else if (type === 'email-verification') {
		text = `Your email verification code is ${otp}`;
	} else if (type === 'forget-password') {
		text = `Your password reset code is ${otp}`;
	} else {
		text = `Your verification code is ${otp}`;
	}

	const html = await render(Otp, { props: { base: PUBLIC_BASE_URL, otp } });

	mailer.sendMail({
		from: 'ZaloKit',
		to: email,
		subject: 'Verification Code',
		text,
		html
	});
}
