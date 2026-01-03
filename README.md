# n8n-nodes-beease-timer

This is an n8n community node. It lets you use Beease Timer in your n8n workflows for time tracking and project management.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

### Workspace
- **Create**: Create a new workspace
- **Delete**: Delete a workspace
- **Get Many**: Retrieve all workspaces
- **Update**: Update a workspace

### Project
- **Create**: Create a new project in a workspace
- **Delete**: Delete a project
- **Get Many**: Retrieve all projects from a workspace
- **Update**: Update a project

### Member Session
- **Create**: Start a new time tracking session
- **Delete**: Delete a session
- **Get Many**: Retrieve sessions with optional filtering
- **Stop**: Stop an active time tracking session
- **Update Comment**: Update the comment of a session

## Credentials

You need a Beease Timer API key to use this node.

### Getting your API Key

1. Log in to your Beease Timer account
2. Navigate to your account settings
3. Find the API section
4. Generate or copy your API key

### Configuring in n8n

1. In n8n, go to **Credentials** > **New**
2. Search for "Beease Timer API"
3. Enter your API key
4. Click **Save**

**Note**: The API URL is automatically configured to the production server (`http://79.137.37.169:8020/api`).

For local development testing, you need to manually change the hardcoded URLs in the source code:
- [nodes/BeeaseTimer/genericFunctions.ts](nodes/BeeaseTimer/genericFunctions.ts) (line ~29)
- [credentials/BeeaseTimerApi.credentials.ts](credentials/BeeaseTimerApi.credentials.ts) (line ~45)

Change `http://79.137.37.169:8020/api` to `http://localhost:3001`

## Compatibility

Compatible with n8n@1.60.0 or later

## Usage

### Example: Start a time tracking session

1. Add the Beease Timer node to your workflow
2. Select **Member Session** as the resource
3. Select **Create** as the operation
4. Configure the project and optional comment
5. Execute the node to start tracking time

### Example: List all projects in a workspace

1. Add the Beease Timer node to your workflow
2. Select **Project** as the resource
3. Select **Get Many** as the operation
4. Select the workspace
5. Execute the node to retrieve all projects

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [Beease website](https://beease.com)

## Development

To run this node locally in development mode:

1. Clone the repository
2. Copy `.env.example` to `.env` and set `NODE_ENV=development`
3. Run `npm install`
4. Run `npm run dev` to start n8n with the node in development mode

## License

[MIT](LICENSE)

