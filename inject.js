import { TransformStream } from "node:stream/web";

if (!globalThis.TransformStream) globalThis.TransformStream =TransformStream

// export { TransformStream}