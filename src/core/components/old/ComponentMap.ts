import { ComponentTypeEnum } from "../ComponentTypeEnum";
import type { Position } from "@/core/components/old/Position";

/**
 * Map each component type to its enum interface
 * @todo Refacto this class to make it more abstract and reusable
 * ComponentMap<E extends Record<string, string>, T> = {
 *      [K in keyof E]: K extends keyof T ? T[K] : never;
 * };
 */
export type ComponentMap = {
    [K in keyof typeof ComponentTypeEnum]: K extends "Position" ? Position : never;
    // Ajoute d'autres composants ici
};