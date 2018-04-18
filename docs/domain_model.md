### Domain Model

| Sl. No. | Entity                | Extends       | Ember Type | Entity Type              | Extends             | Ember Type |
| ------- | --------------------- | ------------- | ---------- | ------------------------ | ------------------- | ---------- |
| 1       | Text                  | Element       | Object     | TextEntity               | ElementEntity       | Model      |
| 2       | Line                  | Element       | Object     | LineEntity               | ElementEntity       | Model      |
| 3       | Circle                | Element       | Object     | CircleEntity             | ElementEntity       | Model      |
| 4       | Rectangle             | Element       | Object     | RectangleEntity          | ElementEntity       | Model      |
| 5       | FilledRectangle       | Element       | Object     | FilledRectangleEntity    | ElementEntity       | Model      |
| 6       | BoundedArea           | Metadata      | Object     | BoundedAreaEntity        | MetadataEntity      | Model      |
| 7       | Grid                  | Metadata      | Object     | GridEntity               | MetadataEntity      | Model      |
| 8       | Door                  | DrawingObject | Object     | DoorEntity               | DrawingObjectEntity | Model      |
| 9       | Wall                  | DrawingObject | Object     | WallEntity               | DrawingObjectEntity | Model      |
| 10      | Point                 | Helper        | Object     | PointEntity              | HelperEntity        | Model      |
| 11      | Marker                | Helper        | Object     | MarkerEntity             | HelperEntity        | Model      |
| 12      | Intersection          | Helper        | Object     | IntersectionEntity       | HelperEntity        | Model      |
| 13      | BindingElement        | Helper        | Object     | BindingElementEntity     | HelperEntity        | Model      |
| 14      | GroupElement          | Helper        | Object     | GroupElementEntity       | HelperEntity        | Model      |
| 15      | Split                 | Feature       | Object     |                          |                     |            |
| 16      | Split1D               | Helper        | Object     | Split1DElementEntity     |                     | Model      |
| 17      | Split2D               | Helper        | Object     | Split2DElementEntity     |                     | Model      |
| 18      | SplitCircle           | Helper        | Object     | SplitCircleElementEntity |                     | Model      |
| 19      | Group                 | Feature       | Object     |                          |                     |            |
| 20      | CollisionIntersection | Collision     | Feature    |                          |                     |            |
| 21      | CollisionLink         | Collision     | Feature    |                          |                     |            |
| 22      | CollisionMesh         | Collision     | Feature    |                          |                     |            |
| 23      | Binding               | Feature       | Object     |                          |                     |            |
| 24      | Join                  | Feature       | Object     |                          |                     |            |
| 25      | Grid                  | Feature       | Object     |                          |                     |            |
| 26      | GridElement           |               | Object     | GridElementEntity        |                     | Model      |
| 27      | Select                | Interaction   | Object     |                          |                     |            |
| 28      | Move                  | Interaction   | Object     |                          |                     |            |
| 29      | Zoom                  | Interaction   | Object     |                          |                     |            |
| 30      | Pan                   | Interaction   | Object     |                          |                     |            |
