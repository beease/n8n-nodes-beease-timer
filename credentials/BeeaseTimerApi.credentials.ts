import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class BeeaseTimerApi implements ICredentialType {
	name = 'beeaseTimerApi';

	displayName = 'Beease Timer API';

	icon: Icon = { light: 'file:../icons/time_machine_off.svg', dark: 'file:../icons/time_machine_off.dark.svg' };

	documentationUrl =
		'https://beease.com';

	properties: INodeProperties[] = [
		{
			displayName: "API Key",
			name: "apiKey",
			type: "string",
			default: "",
			required: true,
			typeOptions: { password: true },
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: "generic",
		properties: {
			headers: {
				"x-api-key": "={{$credentials.apiKey}}",
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			method: "GET",
			// URL de production - Pour développement local, remplacer par 'http://localhost:3001'
			baseURL: 'http://79.137.37.169:8020/api',
			url: "/api/credential.isLogged",
			body: { 0: null },
			json: true,
		},
	};
}
