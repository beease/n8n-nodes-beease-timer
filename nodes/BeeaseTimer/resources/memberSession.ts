import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { beeaseTrpcCall, toNodeItems, safeString } from "../genericFunctions";

const PROC = {
	create: "memberSession.createSession",
	delete: "memberSession.deleteSession",
	stop: "memberSession.stopSession",
	updateComment: "memberSession.updateComment",
} as const;

export const memberSessionProperties: INodeProperties[] = [
	{
		displayName: "Session Operation",
		name: "sessionOperation",
		type: "options",
		noDataExpression: true,
		default: "create",
		displayOptions: { show: { resource: ["memberSession"] } },
		options: [
			{ name: "Create Session", value: "create" },
			{ name: "Delete Session", value: "delete" },
			{ name: "Stop Session", value: "stop" },
			{ name: "Update Comment", value: "updateComment" },
		],
	},
	{
		displayName: "Project Name or ID",
		name: "projectId",
		type: "options",
		description: "Choose from the list, or specify an ID using an <a href=\"https://docs.n8n.io/code/expressions/\">expression</a>",
		typeOptions: { loadOptionsMethod: "loadProjectsForSessions" },
		default: "",
		required: true,
		displayOptions: {
			show: {
				resource: ["memberSession"],
				sessionOperation: ["create", "stop"],
			},
		},
	},
	{
		displayName: "Started At",
		name: "startedAt",
		type: "string",
		default: "",
		required: true,
		placeholder: "2024-01-01T10:00:00Z",
		description: "Session start time (ISO format)",
		displayOptions: { show: { resource: ["memberSession"], sessionOperation: ["create"] } },
	},
	{
		displayName: "Ended At",
		name: "endedAt",
		type: "string",
		default: "",
		placeholder: "2024-01-01T12:00:00Z",
		description: "Session end time (ISO format) - optional for create, required for stop",
		displayOptions: { 
			show: { 
				resource: ["memberSession"], 
				sessionOperation: ["create", "stop"] 
			} 
		},
	},
	{
		displayName: "Comment",
		name: "comment",
		type: "string",
		default: "",
		description: "Optional comment for the session",
		displayOptions: { 
			show: { 
				resource: ["memberSession"], 
				sessionOperation: ["create", "updateComment"] 
			} 
		},
	},
	{
		displayName: "Session ID",
		name: "sessionId",
		type: "string",
		default: "",
		required: true,
		description: "Session ID to delete or update",
		displayOptions: {
			show: {
				resource: ["memberSession"],
				sessionOperation: ["delete", "updateComment"],
			},
		},
	},
];

export async function executeMemberSession(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const op = safeString(this.getNodeParameter("sessionOperation", itemIndex));

	if (op === "create") {
		const projectId = safeString(this.getNodeParameter("projectId", itemIndex));
		const startedAt = safeString(this.getNodeParameter("startedAt", itemIndex));
		const endedAt = safeString(this.getNodeParameter("endedAt", itemIndex));
		const comment = safeString(this.getNodeParameter("comment", itemIndex));

		const payload = { projectId, startedAt, endedAt, comment };

		const data = await beeaseTrpcCall.call(this, PROC.create, payload);
		return toNodeItems(data);
	}

	if (op === "stop") {
		const projectId = safeString(this.getNodeParameter("projectId", itemIndex));
		const endedAt = safeString(this.getNodeParameter("endedAt", itemIndex));

		const payload = { projectId, endedAt };

		const data = await beeaseTrpcCall.call(this, PROC.stop, payload);
		return toNodeItems(data);
	}

	if (op === "delete") {
		const sessionId = safeString(this.getNodeParameter("sessionId", itemIndex));
		const data = await beeaseTrpcCall.call(this, PROC.delete, { sessionId });
		return toNodeItems(data);
	}

	if (op === "updateComment") {
		const sessionId = safeString(this.getNodeParameter("sessionId", itemIndex));
		const comment = safeString(this.getNodeParameter("comment", itemIndex));
		const data = await beeaseTrpcCall.call(this, PROC.updateComment, { sessionId, comment });
		return toNodeItems(data);
	}

	return [{ json: { error: `Unsupported session operation: ${op}` } }];
}