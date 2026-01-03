import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { beeaseTrpcCall, toNodeItems, pickNonEmptyObject, safeString } from "../genericFunctions";

const PROC = {
	create: "project.createProject",
	getByWorkspace: "project.getProjectsByWorkspaceId",
	update: "project.updateProject",
	del: "project.deleteProject",
} as const;

export const projectProperties: INodeProperties[] = [
	{
		displayName: "Project Operation",
		name: "projectOperation",
		type: "options",
		noDataExpression: true,
		default: "list",
		displayOptions: { show: { resource: ["project"] } },
		options: [
			{ name: "Create Project", value: "create" },
			{ name: "Delete Project", value: "delete" },
			{ name: "Get Projects by Workspace", value: "list" },
			{ name: "Update Project", value: "update" },
		],
	},
	{
		displayName: "Name",
		name: "projectName",
		type: "string",
		default: "",
		required: true,
		displayOptions: { show: { resource: ["project"], projectOperation: ["create"] } },
	},
	{
		displayName: "Color",
		name: "projectColor",
		type: "color",
		default: "#3B82F6",
		required: true,
		displayOptions: { show: { resource: ["project"], projectOperation: ["create"] } },
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
				resource: ["project"],
				projectOperation: ["create", "list"],
			},
		},
	},
	{
		displayName: "Project Name or ID",
		name: "projectId",
		type: "options",
		description: "Choose from the list, or specify an ID using an <a href=\"https://docs.n8n.io/code/expressions/\">expression</a>",
		typeOptions: { loadOptionsMethod: "loadProjects" },
		default: "",
		required: true,
		displayOptions: {
			show: {
				resource: ["project"],
				projectOperation: ["update", "delete"],
			},
		},
	},
	{
		displayName: "Update Data",
		name: "projectUpdateData",
		type: "collection",
		placeholder: "Add field",
		default: {},
		displayOptions: {
			show: {
				resource: ["project"],
				projectOperation: ["update"],
			},
		},
		options: [
			{ displayName: "Color", name: "color", type: "color", default: "" },
			{ displayName: "Daily Price", name: "dailyPrice", type: "number", default: null },
			{ displayName: "Hour by Day", name: "hourByDay", type: "number", default: null },
			{ displayName: "Is Archived", name: "isArchived", type: "boolean", default: false },
			{ displayName: "Name", name: "name", type: "string", default: "" },
		],
	},
];

export async function executeProject(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const op = safeString(this.getNodeParameter("projectOperation", itemIndex));

	if (op === "create") {
		const name = safeString(this.getNodeParameter("projectName", itemIndex));
		const color = safeString(this.getNodeParameter("projectColor", itemIndex));
		const workspaceId = safeString(this.getNodeParameter("workspaceId", itemIndex));

		const data = await beeaseTrpcCall.call(this, PROC.create, { name, color, workspaceId });
		return toNodeItems(data);
	}

	if (op === "list") {
		const workspaceId = safeString(this.getNodeParameter("workspaceId", itemIndex));
		const data = await beeaseTrpcCall.call(this, PROC.getByWorkspace, { workspaceId }, 'GET');
		return toNodeItems(data);
	}

	if (op === "update") {
		const id = safeString(this.getNodeParameter("projectId", itemIndex));
		const patchRaw = this.getNodeParameter("projectUpdateData", itemIndex);
		const patch = pickNonEmptyObject(patchRaw);

		const payload = { data: patch, id };
		const data = await beeaseTrpcCall.call(this, PROC.update, payload);
		return toNodeItems(data);
	}

	if (op === "delete") {
		const id = safeString(this.getNodeParameter("projectId", itemIndex));
		const data = await beeaseTrpcCall.call(this, PROC.del, { id });
		return toNodeItems(data);
	}

	return [{ json: { error: `Unsupported project operation: ${op}` } }];
}
