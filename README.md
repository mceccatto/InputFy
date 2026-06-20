# InputFy

Validador TypeScript-first **compatível com Zod** (`v` / `z`), com zero dependências runtime no core.

**Requisitos:** Node.js 18+

---

## Instalação

```bash
npm install inputfy
```

| Registry | Comando |
|----------|---------|
| npm | `npm install inputfy` |
| JSR | `npx jsr add @inputfy/core` |
| Deno | `import { v } from "jsr:@inputfy/core"` |

---

## Início rápido

```typescript
import { v } from "inputfy";
import type { infer } from "inputfy";

const UserSchema = v.object({
  name: v.string().min(1),
  email: v.string().email(),
  age: v.number().int().positive().optional(),
});

type User = infer<typeof UserSchema>;

const result = UserSchema.safeParse({ name: "Ana", email: "ana@example.com" });
if (result.success) {
  console.log(result.data);
}
```

`z` é alias de `v` para compatibilidade com Zod.

---

## Subpaths

Todos os subpaths suportam ESM (`import`) e CJS (`require`).

| Subpath | Uso |
|---------|-----|
| `inputfy` | API completa |
| `inputfy/core` | Core minimal (~1 KB gzip, zero deps) |
| `inputfy/forms` | Formulários web |
| `inputfy/server` | Validação server-side |
| `inputfy/locales` | 63 idiomas |
| `inputfy/express` | Express / Fastify / Koa |
| `inputfy/react-hook-form` | react-hook-form |
| `inputfy/trpc` | tRPC |
| `inputfy/nestjs` | NestJS |
| `inputfy/electron` | IPC Electron |
| `inputfy/drizzle` | Drizzle ORM |
| `inputfy/integrations` | Barrel de integrações |

```typescript
import { v } from "inputfy/core";
import { validate } from "inputfy/express";
import { createServerValidator } from "inputfy/server";
import { getLocaleCodes } from "inputfy/locales";
```

---

## Schemas e parsing

### Tipos primitivos

```typescript
v.string().min(1).max(100).email().url().uuid().trim();
v.number().int().positive().min(0).max(100).multipleOf(5);
v.boolean();
v.date();
v.enum(["admin", "user"] as const);
v.literal("active");
v.any();
v.unknown();
```

### Objetos, arrays e composição

```typescript
const schema = v.object({
  id: v.string().uuid(),
  tags: v.array(v.string()).min(1).max(10),
  role: v.enum(["admin", "user"] as const),
});

schema.extend({ bio: v.string().optional() });
schema.pick({ id: true });
schema.omit({ tags: true });
schema.partial();
schema.strict();
schema.deepPartial();
schema.deepRequired();
```

### Modificadores

```typescript
v.string().optional();
v.string().nullable();
v.string().default("guest");
v.number().catch(0);
v.string().readonly();
v.string().brand("UserId");
v.string().meta({ title: "Nome" }).describe("Nome completo");
```

### Refinamento e transformação

```typescript
v.string()
  .refine((s) => s.length > 0, "Obrigatório")
  .transform((s) => s.trim());

v.preprocess((val) => String(val), v.string());
v.string().pipe(v.coerce.number());
```

### Parsing

```typescript
UserSchema.parse(data);           // lança InputFyError se inválido
UserSchema.safeParse(data);         // { success, data } | { success: false, error }
await UserSchema.parseAsync(data);
await UserSchema.safeParseAsync(data);
```

---

## Erros e i18n

```typescript
import { v, formatErrorHTML, aggregateBySeverity } from "inputfy";
import { getLocaleCodes } from "inputfy/locales";

v.config({ locale: "pt-BR" });

if (!result.success) {
  console.log(result.error.flatten());
  console.log(v.prettifyError(result.error));
  document.body.innerHTML = formatErrorHTML(result.error, { title: "Erros" });
  const { errors, warnings } = aggregateBySeverity(result.error);
}

console.log(getLocaleCodes().length); // 63
```

---

## Validação avançada

```typescript
v.iso.date().parse("2024-06-20");
v.ipv4().parse("192.168.1.1");
v.hexColor().parse("#FF5733");
v.currency({ code: "BRL" }).parse("BRL 123.45");
v.file({ maxSize: 5_000_000, mimeTypes: ["image/png"] });

v.object({
  type: v.enum(["email", "phone"]),
  value: v.when("type", {
    is: "email",
    then: v.string().email(),
    otherwise: v.string().min(10),
  }),
}).crossField([v.crossFieldRules.equals("password", "confirmPassword")]);

v.contextual((ctx) =>
  v.object({
    apiKey: ctx.env === "production" ? v.string().min(32) : v.string().optional(),
  }),
).parse(data, { context: { env: "production" } });
```

---

## Interoperabilidade

```typescript
import { v, toJSONSchema, fromJSONSchema, codec } from "inputfy";

const jsonSchema = v.toJSONSchema(UserSchema, { target: "draft-7" });
const restored = v.fromJSONSchema(jsonSchema);

const DateCodec = v.codec(v.string().datetime(), v.date(), {
  decode: (s) => new Date(s),
  encode: (d) => d.toISOString(),
});

const openApi = v.toOpenAPI({ info: { title: "API", version: "1.0.0" }, paths: {} });
const sdl = v.toGraphQLSDL({ types: { User: UserSchema }, queries: { user: UserSchema } });
```

---

## Performance

```typescript
import { v, compile, createSchemaCache, validateNDJSON } from "inputfy";

const compiled = v.compile(UserSchema);
compiled.validate(data);

const cache = v.createSchemaCache({ maxCompiled: 256 });
cache.parse(UserSchema, data);

const rows = v.validateNDJSON(UserSchema, ndjsonText);

if (v.isWorkerThreadsAvailable()) {
  const pool = v.createValidationWorkerPool(UserSchema, { poolSize: 4 });
  await pool.validate(largePayload);
  pool.terminate();
}
```

---

## Segurança

```typescript
import { v, secureParse, signedSchema } from "inputfy";

v.securityConfig({
  paranoid: true,
  blockUnsafeRegex: true,
});

const result = secureParse(UserSchema, untrustedInput);
const sig = v.signSchema(UserSchema, process.env.SCHEMA_SECRET!);
const trusted = signedSchema(UserSchema, process.env.SCHEMA_SECRET!, sig);
```

Proteções built-in: bloqueio de chaves perigosas, limites de profundidade/tamanho, análise ReDoS e zero `eval`/`Function` (`v.CSP_FRIENDLY === true`).

---

## Developer Experience

```typescript
import { v, generate, diffSchema, migrateZodToInputFy } from "inputfy";

const mock = v.generate(UserSchema, { seed: 42 });
const diff = v.diffSchema(schemaV1, schemaV2);
const { code } = v.migrateZodToInputFy(zodSourceCode);
await v.writePlaygroundFile("playground.html");
```

### CLI

```bash
npx inputfy validate --schema user.schema.json --data payload.json
npx inputfy diff --left v1.json --right v2.json
npx inputfy generate --schema user.schema.json --count 5 --seed 42
npx inputfy migrate --input legacy.ts --output migrated.ts
npx inputfy playground --output playground.html
```

---

## Integrações

### Express / Fastify / Koa

```typescript
import { validate } from "inputfy/express";

app.post("/users", validate(UserSchema), (req, res) => {
  res.json(req.validatedBody);
});
```

### react-hook-form

```typescript
import { useForm } from "react-hook-form";
import { inputfyResolver } from "inputfy/react-hook-form";

const form = useForm({ resolver: inputfyResolver(UserSchema) });
```

### tRPC

```typescript
import { inputfyInput } from "inputfy/trpc";

procedure.input(inputfyInput(UserSchema).schema);
```

### NestJS

```typescript
import { InputFyValidationPipe } from "inputfy/nestjs";

@Post()
create(@Body(new InputFyValidationPipe(UserSchema)) body: User) {}
```

### Electron

```typescript
import { validateIpcHandler } from "inputfy/electron";

ipcMain.handle("save-user", validateIpcHandler(UserSchema, saveUser));
```

### Drizzle

```typescript
import { createSelectSchema } from "inputfy/drizzle";

const UserSchema = createSelectSchema(usersTable);
```

---

## Ecossistema

```typescript
import { v } from "inputfy/core";
import { createFormValidator } from "inputfy/forms";
import { createServerValidator } from "inputfy/server";

const serverValidator = createServerValidator(UserSchema, {
  useCompile: true,
  secure: true,
});
```

---

## TypeScript

```typescript
import { v } from "inputfy";
import type { infer, Branded, DeepPartial } from "inputfy";

type User = infer<typeof UserSchema>;
type PartialUser = DeepPartial<typeof UserSchema>;

const Email = v.branded(v.string().email(), { brand: "Email" });
const UserId = v.templateLiteral("user_", v.string().regex(/^[a-z]+$/));
const Versioned = v.versionedSchema(
  { "1.0.0": UserV1, "2.0.0": UserV2 },
  { current: "2.0.0" },
);
```

---

## Observabilidade

```typescript
import { v, configureObservability, createHealthCheckHandler } from "inputfy";

configureObservability({
  enabled: true,
  metrics: v.createValidationMetrics(),
});

v.observedSafeParse(UserSchema, data, { schemaId: "User" });
app.get("/health", createHealthCheckHandler({ User: UserSchema }));
```

---

## Licença

[MIT](./LICENSE)
