import { sync as syncSchema } from "../../convex/sync/schema";
import { DefinitionFactory } from "@microdotbuilder/local-store/react";
import { DataModelFromSchemaDefinition } from "convex/server";
import type {
  LocalDbReader,
  LocalDbWriter,
} from "@microdotbuilder/local-store/react";

export type SyncDataModel = DataModelFromSchemaDefinition<typeof syncSchema>;

export const factory = new DefinitionFactory(syncSchema);

export type LocalQueryCtx = { localDb: LocalDbReader<SyncDataModel> };
export type LocalMutationCtx = { localDb: LocalDbWriter<SyncDataModel> };
