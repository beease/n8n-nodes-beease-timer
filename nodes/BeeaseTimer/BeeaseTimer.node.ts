// nodes/Beease/Beease.node.ts
import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
} from "n8n-workflow";
import { beeaseTrpcCall } from "./genericFunctions";

import { workspaceProperties, executeWorkspace } from "./resources/workspace";
import { projectProperties, executeProject } from "./resources/project";
import { memberSessionProperties, executeMemberSession } from "./resources/memberSession";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readIdName(item: unknown): { id: string; name: string } | null {
	if (!isRecord(item)) return null;
	const id = typeof item.id === "string" ? item.id : "";
	const name =
		typeof item.name === "string"
			? item.name
			: typeof item.id === "string"
				? item.id
				: "";
	if (!id) return null;
	return { id, name };
}

export class BeeaseTimer implements INodeType {
	description: INodeTypeDescription = {
		displayName: "Beease Timer",
		name: "beeaseTimer",
		group: ["output"],
		version: 1,
		description: "CRUD Workspaces, Projects, Members, Sessions via Beease API",
		defaults: { name: "Beease Timer" },
		inputs: ["main"],
		outputs: ["main"],
		credentials: [{ name: "beeaseTimerApi", required: true }],
		icon: "file:../../icons/time_machine_off.svg",
		usableAsTool: true,
		subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
		properties: [
			{
				displayName: "Resource",
				name: "resource",
				type: "options",
				noDataExpression: true,
				default: "workspace",
				options: [
					{ name: "Workspace", value: "workspace" },
					{ name: "Project", value: "project" },
					{ name: "Session", value: "memberSession" },
				],
			},

			...workspaceProperties,
			...projectProperties,
			// ...memberWorkspaceProperties,
			...memberSessionProperties,
		],
	};

	methods = {
		loadOptions: {
			async loadWorkspaces(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const raw = await beeaseTrpcCall.call(this, "workspace.getMyWorkspaces", null, 'GET') as unknown;
				const list = Array.isArray(raw) ? raw : [];
				return list
					.map(readIdName)
					.filter((v): v is { id: string; name: string } => v !== null)
					.map((w) => ({ name: w.name, value: w.id }));
			},

			async loadProjects(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const raw = await beeaseTrpcCall.call(this, "project.getAllMyProjects", null, 'GET') as unknown;
				const list = Array.isArray(raw) ? raw : [];
				return list
					.map(readIdName)
					.filter((v): v is { id: string; name: string } => v !== null)
					.map((p) => ({ name: p.name, value: p.id }));
			},

			async loadProjectsForSessions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const raw = await beeaseTrpcCall.call(this, "project.getAllMyProjects", null, 'GET') as unknown;
				const list = Array.isArray(raw) ? raw : [];

				return list
					.map(readIdName)
					.filter((v): v is { id: string; name: string } => v !== null)
					.map((p) => ({ name: p.name, value: p.id }));
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const out: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const resource = this.getNodeParameter("resource", i);
			const res = typeof resource === "string" ? resource : "";

			if (res === "workspace") {
				out.push(...(await executeWorkspace.call(this, i)));
				continue;
			}
			if (res === "project") {
				out.push(...(await executeProject.call(this, i)));
				continue;
			}
			// if (res === "memberWorkspace") {
			// 	out.push(...(await executeMemberWorkspace.call(this, i)));
			// 	continue;
			// }
			if (res === "memberSession") {
				out.push(...(await executeMemberSession.call(this, i)));
				continue;
			}

			out.push({ json: { error: `Unsupported resource: ${res}` } });
		}

		return [out];
	}
}
