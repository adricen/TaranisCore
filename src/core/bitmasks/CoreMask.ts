export enum CoreMask {
    None = 0,               // 0 - No components
    Position = 1 << 0,      // 1 - Basic position in world space
    Rotation = 1 << 1,      // 2 - Euler Rotation
    Quaternion = 1 << 2,    // 4 - Quaternion Rotation
    Scale = 1 << 3,         // 8 - Scale/size
    Renderable = 1 << 4,    // 16 - Is renderable
    HtmlElement = 1 << 5,   // 32 - Has HTML DOM element
    Visible = 1 << 6,       // 64 - Is currently visible
    Debug = 1 << 7,         // 512 - Is in debug mode   
    Name = 1 << 8,          // 1024 - Has a name/identifier
    Tags = 1 << 9,          // 2048 - Has tags for categorization
    width = 1 << 10,        // 4096 - Width property
    height = 1 << 11,       // 8192 - Height property
    id = 1 << 12,           // 16384 - Unique identifier
    isDirty = 1 << 13,      // 65536 - Is marked as dirty/needs update
    isActive = 1 << 14,     // 131072 - Is currently active
    isDebug = 1 << 15,      // 262144 - Is in debug mode
    isHovered = 1 << 16,    // 524288 - Is currently hovered
    isClicked = 1 << 17,    // 1048576 - Is currently clicked
};