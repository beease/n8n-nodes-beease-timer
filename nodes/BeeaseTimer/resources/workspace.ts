import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { beeaseTrpcCall, toNodeItems, pickNonEmptyObject, safeString } from "../genericFunctions";

const PROC = {
	create: "workspace.createWorkspace",
	listMine: "workspace.getMyWorkspaces",
	getById: "workspace.getWorkspaceById",
	update: "workspace.updateWorkspace",
	del: "workspace.deleteWorkspace",
} as const;

export const workspaceProperties: INodeProperties[] = [
	{
		displayName: "Workspace Operation",
		name: "workspaceOperation",
		type: "options",
		noDataExpression: true,
		default: "list",
		displayOptions: { show: { resource: ["workspace"] } },
		options: [
			{ name: "Create Workspace", value: "create" },
			{ name: "Delete Workspace", value: "delete" },
			{ name: "Get My Workspaces", value: "list" },
			{ name: "Update Workspace", value: "update" },
		],
	},
	{
		displayName: "Name",
		name: "workspaceName",
		type: "string",
		default: "",
		required: true,
		displayOptions: { show: { resource: ["workspace"], workspaceOperation: ["create"] } },
	},
	{
		displayName: "Color",
		name: "workspaceColor",
		type: "color",
		default: "#3B82F6",
		required: true,
		displayOptions: { show: { resource: ["workspace"], workspaceOperation: ["create"] } },
	},
	{
		displayName: "Workspace Name or ID",
		name: "workspaceId",
		type: "options",
		description: "Choose from the list, or specify an ID using an <a href=\"https://docs.n8n.io/code/expressions/\">expression</a>",
		typeOptions: { loadOptionsMethod: "loadWorkspaces" },
		default: "",
		required: true,
		displayOptions: {
			show: {
				resource: ["workspace"],
				workspaceOperation: ["get", "update", "delete"],
			},
		},
	},
	{
		displayName: "Update Data",
		name: "workspaceUpdateData",
		type: "collection",
		placeholder: "Add field",
		default: {},
		displayOptions: {
			show: {
				resource: ["workspace"],
				workspaceOperation: ["update"],
			},
		},
		options: [
			{ displayName: "Name", name: "name", type: "string", default: "" },
			{ displayName: "Color", name: "color", type: "color", default: "" },
		],
	},
];

export async function executeWorkspace(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const op = safeString(this.getNodeParameter("workspaceOperation", itemIndex));

	if (op === "create") {
		const name = safeString(this.getNodeParameter("workspaceName", itemIndex));
		const color = safeString(this.getNodeParameter("workspaceColor", itemIndex));

		const data = await beeaseTrpcCall.call(this, PROC.create, { name, color });
		return toNodeItems(data);
	}

	if (op === "list") {
		const data = await beeaseTrpcCall.call(this, PROC.listMine, null, 'GET');
		return toNodeItems(data);
	}

	if (op === "update") {
		const id = safeString(this.getNodeParameter("workspaceId", itemIndex));
		const patchRaw = this.getNodeParameter("workspaceUpdateData", itemIndex);
		const patch = pickNonEmptyObject(patchRaw);

		const payload = { data: patch, id };
		const data = await beeaseTrpcCall.call(this, PROC.update, payload);
		return toNodeItems(data);
	}

	if (op === "delete") {
		const id = safeString(this.getNodeParameter("workspaceId", itemIndex));
		const data = await beeaseTrpcCall.call(this, PROC.del, { id });
		return toNodeItems(data);
	}

	return [{ json: { error: `Unsupported workspace operation: ${op}` } }];
}
