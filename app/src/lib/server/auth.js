import { logger } from '$lib/server/logger';
import { db } from '$lib/server/db';
import { user, appUser } from '$schema';
import { eq } from 'drizzle-orm';

import { betterAuth } from 'better-auth';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { emailOTP, organization, phoneNumber, admin, apiKey, openAPI } from 'better-auth/plugins';
import { APIError, createAuthMiddleware } from 'better-auth/api';
import { passkey } from '@better-auth/passkey';
import { stripe } from '@better-auth/stripe';
import { dash } from '@better-auth/infra';
import Stripe from 'stripe';

import { PUBLIC_BASE_URL } from '$env/dynamic/public';
import { getRequestEvent } from '$app/server';
import { twilioClient } from '$lib/server/twilio';
import { firstName } from '$lib/utils.js';
import { userCreated } from './auth-lifecycle';

// When running npm run auth:generate. .svelte import (in mail.js) breaks better-auth codegen otherwise.
let sendVerificationEmail;
if (process.env.ENV !== 'auth') {
	sendVerificationEmail = (await import('$lib/server/mail')).sendVerificationEmail;
}

const stripeClient = new Stripe('process.env.STRIPE_SECRET_KEY!', {
	apiVersion: '2025-11-17.clover'
});

// See for details: https://www.better-auth.com/docs/reference/options
export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'pg'
	}),
	logger: {
		disabled: false,
		disableColors: false,
		level: process.env.ENV === 'dev' ? 'info' : 'warn',
		log: (level, message, ...args) => {
			// Custom logging implementation
			logger[level](...args, message);
		}
	},
	onAPIError: {
		throw: true,
		onError: (error, ctx) => {
			// Custom error handling
		}
	},
	rateLimit: {
		enabled: true,
		window: 60, // time window in seconds
		max: 100, // max requests in the window
		customRules: {
			'/home/auth': {
				window: 60,
				max: 50
			}
		}
	},
	advanced: {
		ipAddress: {
			ipv6Subnet: 64 // Rate limit by /64 subnet instead of individual addresses (IPV6 gives a lot of addresses to individual LANs, so this is more effective)
		}
	},
	emailVerification: {
		sendVerificationEmail: async ({ user, url, token }, req) => {
			await sendVerificationEmail(user.email, url, 'emailVerification');
		},
		autoSignInAfterVerification: true,
		sendOnSignUp: false,
		sendOnSignIn: false
	},
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true
	},
	user: {
		additionalFields: {
			// myField: {
			// 	type: 'string',
			// 	required: false
			// }
		},
		deleteUser: {
			enabled: true
		},
		changeEmail: {
			enabled: true
		}
	},
	socialProviders: {
		google: {
			accessType: 'offline',
			prompt: 'select_account consent',
			clientId: process.env.OAUTH_GOOGLE_CLIENT_ID,
			clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET,
			scope: ['email', 'profile']
		}
	},
	databaseHooks: {
		user: {
			create: {
				// Runs once when a new user is inserted
				async after(user, ctx) {
					const organization = await auth.api.createOrganization({
						body: {
							name: `${firstName(user.name)}'s Workspace`,
							slug: `${user.id}`, // to avoid collisions
							metadata: {},
							userId: user.id,
							keepCurrentActiveOrganization: false // auto switch to the new org
						}
					});

					await db
						.insert(appUser)
						.values({ userId: user.id, lastOrgId: organization.id })
						.onConflictDoNothing();
				}
			}
		},
		session: {
			create: {
				before: async (session, ctx) => {
					const res = await db
						.select({ lastOrgId: appUser.lastOrgId })
						.from(appUser)
						.where(eq(appUser.userId, session.userId))
						.limit(1);

					return {
						data: {
							...session,
							activeOrganizationId: res[0].lastOrgId // set the session's active org to the user's last active org (if any) upon login
						}
					};
				}
			},
			update: {
				after: async (session, ctx) => {
					if (session.activeOrganizationId) {
						await db
							.update(appUser)
							.set({
								lastOrgId: session.activeOrganizationId
							})
							.where(eq(appUser.userId, session.userId));
					}
				}
			}
		}
	},
	plugins: [
		//dash(),
		openAPI(),
		stripe({
			stripeClient,
			stripeWebhookSecret: 'process.env.STRIPE_WEBHOOK_SECRET',
			createCustomerOnSignUp: true
		}),
		apiKey({
			defaultPrefix: 'zalokit',
			enableSessionForAPIKeys: true,
			enableMetadata: true,
			storage: 'database',
			apiKeyHeaders: ['x-api-key'],
			rateLimit: {
				enabled: true,
				timeWindow: 1000 * 60 * 60 * 24, // 1 day
				maxRequests: 10 // 10 requests per day
			}
			//  permissions: {
			// 	defaultPermissions: {
			// 		files: ['read'],
			// 		users: ['read']
			// 	}
			// }
		}),
		sveltekitCookies(getRequestEvent),
		passkey(),
		emailOTP({
			overrideDefaultEmailVerification: false,
			expiresIn: 60 * 30,
			async sendVerificationOTP({ email, otp, type }) {
				await sendVerificationEmail(email, otp, type);
			}
		}),
		phoneNumber({
			sendOTP: async ({ phoneNumber, code }, ctx) => {
				await twilioClient.messages.create({
					to: phoneNumber,
					from: env.TWILIO_FROM,
					body: `Your verification code is ${code}`
				});
			}
		}),
		admin(),
		organization({
			schema: {
				organization: {
					// Add custom fields to the organization schema
					additionalFields: {}
				}
			},
			requireEmailVerificationOnInvitation: true,
			allowUserToCreateOrganization: async (user) => {
				//const subscription = await getSubscription(user.id);
				//return subscription.plan === 'pro';
				return true;
			},
			async sendInvitationEmail(data) {
				const inviteLink = `https://example.com/accept-invitation/${data.id}`;
				sendOrganizationInvitation({
					email: data.email,
					invitedByUsername: data.inviter.user.name,
					invitedByEmail: data.inviter.user.email,
					teamName: data.organization.name,
					inviteLink
				});
			},
			teams: {
				enabled: true,
				allowRemovingAllTeams: false, // Prevent removing the last team
				maximumTeams: 10, // Fixed number
				// OR
				maximumTeams: async ({ organizationId, session }, ctx) => {
					// Dynamic limit based on organization plan
					const plan = await getPlan(organizationId);
					return plan === 'pro' ? 20 : 5;
				},
				maximumMembersPerTeam: 10, // Fixed number
				// OR
				maximumMembersPerTeam: async ({ teamId, session, organizationId }, ctx) => {
					// Dynamic limit based on team plan
					const plan = await getPlan(organizationId, teamId);
					return plan === 'pro' ? 50 : 10;
				}
			},
			organizationHooks: {
				// Organization operations
				beforeCreateOrganization: async ({ organization, user }) => {
					// Run custom logic before organization is created
					// Optionally modify the organization data
					// return {
					// 	data: {
					// 		...organization,
					// 		metadata: {
					// 			customField: 'value'
					// 		}
					// 	}
					// };
				},
				afterCreateOrganization: async ({ organization, member, user }) => {
					// Run custom logic after organization is created
					// e.g., create default resources, send notifications
					// await setupDefaultResources(organization.id);
				},
				beforeUpdateOrganization: async ({ organization, user, member }) => {
					// Validate updates, apply business rules
					// return {
					// 	data: {
					// 		...organization,
					// 		name: organization.name?.toLowerCase()
					// 	}
					// };
				},
				afterUpdateOrganization: async ({ organization, user, member }) => {
					// Sync changes to external systems
					// await syncOrganizationToExternalSystems(organization);
				},

				// Member operations
				beforeAddMember: async ({ member, user, organization }) => {
					// // Custom validation or modification
					// console.log(`Adding ${user.email} to ${organization.name}`);
					// // Optionally modify member data
					// return {
					// 	data: {
					// 		...member,
					// 		role: 'custom-role' // Override the role
					// 	}
					// };
				},
				afterAddMember: async ({ member, user, organization }) => {
					// Send welcome email, create default resources, etc.
					// await sendWelcomeEmail(user.email, organization.name);
				},
				beforeRemoveMember: async ({ member, user, organization }) => {
					// Cleanup user's resources, send notification, etc.
					// await cleanupUserResources(user.id, organization.id);
				},
				afterRemoveMember: async ({ member, user, organization }) => {
					// await logMemberRemoval(user.id, organization.id);
				},
				beforeUpdateMemberRole: async ({ member, newRole, user, organization }) => {
					// Validate role change permissions
					// if (newRole === 'owner' && !hasOwnerUpgradePermission(user)) {
					// 	throw new Error('Cannot upgrade to owner role');
					// }
					// // Optionally modify the role
					// return {
					// 	data: {
					// 		role: newRole
					// 	}
					// };
				},
				afterUpdateMemberRole: async ({ member, previousRole, user, organization }) => {
					// await logRoleChange(user.id, previousRole, member.role);
				},

				// Invitation operations
				beforeCreateInvitation: async ({ invitation, inviter, organization }) => {
					// Custom validation or expiration logic
					const customExpiration = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
					return {
						data: {
							...invitation,
							expiresAt: customExpiration
						}
					};
				},
				afterCreateInvitation: async ({ invitation, inviter, organization }) => {
					// Send custom invitation email, track metrics, etc.
					// await sendCustomInvitationEmail(invitation, organization);
				},
				beforeAcceptInvitation: async ({ invitation, user, organization }) => {
					// Additional validation before acceptance
					// await validateUserEligibility(user, organization);
				},
				afterAcceptInvitation: async ({ invitation, member, user, organization }) => {
					// Setup user account, assign default resources
					// await setupNewMemberResources(user, organization);
				},
				beforeRejectInvitation: async ({ invitation, user, organization }) => {
					// Log rejection reason, send notification to inviter
				},
				afterRejectInvitation: async ({ invitation, user, organization }) => {
					// await notifyInviterOfRejection(invitation.inviterId, user.email);
				},
				beforeCancelInvitation: async ({ invitation, cancelledBy, organization }) => {
					// Verify cancellation permissions
				},
				afterCancelInvitation: async ({ invitation, cancelledBy, organization }) => {
					// await logInvitationCancellation(invitation.id, cancelledBy.id);
				},

				// Team operations
				beforeCreateTeam: async ({ team, user, organization }) => {
					// Validate team name, apply naming conventions
					return {
						data: {
							...team,
							name: team.name.toLowerCase().replace(/\s+/g, '-')
						}
					};
				},
				afterCreateTeam: async ({ team, user, organization }) => {
					// Create default team resources, channels, etc.
					// await createDefaultTeamResources(team.id);
				},
				beforeUpdateTeam: async ({ team, updates, user, organization }) => {
					// Validate updates, apply business rules
					return {
						data: {
							...updates,
							name: updates.name?.toLowerCase()
						}
					};
				},
				afterUpdateTeam: async ({ team, user, organization }) => {
					// await syncTeamChangesToExternalSystems(team);
				},
				beforeDeleteTeam: async ({ team, user, organization }) => {
					// Backup team data, notify members
					// await backupTeamData(team.id);
				},
				afterDeleteTeam: async ({ team, user, organization }) => {
					// await cleanupTeamResources(team.id);
				},

				// Team member operations
				beforeAddTeamMember: async ({ teamMember, team, user, organization }) => {
					// Validate team membership limits, permissions
					const memberCount = await getTeamMemberCount(team.id);
					if (memberCount >= 10) {
						throw new Error('Team is full');
					}
				},
				afterAddTeamMember: async ({ teamMember, team, user, organization }) => {
					// await grantTeamAccess(user.id, team.id);
				},
				beforeRemoveTeamMember: async ({ teamMember, team, user, organization }) => {
					// Backup user's team-specific data
					// await backupTeamMemberData(user.id, team.id);
				},
				afterRemoveTeamMember: async ({ teamMember, team, user, organization }) => {
					// await revokeTeamAccess(user.id, team.id);
				},
				beforeDeleteOrganization: async (data, request) => {
					// a callback to run before deleting org
				},
				afterDeleteOrganization: async (data, request) => {
					// a callback to run after deleting org
				}
			}
		})
	]
});
