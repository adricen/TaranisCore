export type ComponentEvent =
  | { entityId: number; type: "PositionAdded"; componentType: ComponentType.Position }
  | { entityId: number; type: "PositionRemoved"; componentType: ComponentType.Position }
  | { entityId: number; type: "HealthAdded"; componentType: ComponentType.Health }
  | { entityId: number; type: "HealthRemoved"; componentType: ComponentType.Health }
  // Ajoute d'autres événements ici
;