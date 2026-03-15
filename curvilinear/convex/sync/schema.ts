import { tableResolverFactory } from "@microdotbuilder/local-store/server";
import { streamQueryForServerSchema } from "@microdotbuilder/local-store/server";
import schema from "../schema";

// Local store mirrors the DB 1:1 — single source of truth.
export const sync = schema;

export const s = tableResolverFactory(sync, schema);
export const streamQuery = streamQueryForServerSchema(schema);
