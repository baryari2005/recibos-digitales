# QA Checklist - Dashboard RBAC

## Referencias

- [ ] Pendiente
- [x] OK
- [ ] Falla
- [ ] No aplica

---

## Datos de ejecución

- Proyecto: Centro de ojos Ituzaingo (Gestión de documentos)
- Ambiente: Test
- Fecha: 2026-03-25
- Tester: Thiago Manzoni
- Rama / commit:
- Observaciones generales:

---

# 1. Build, tipos y calidad

## BUILD-001 - El proyecto compila con `npm run build`
- [X] Estado
- Resultado esperado: compila sin errores bloqueantes
- Resultado obtenido:
- Observaciones:

## BUILD-002 - El proyecto levanta con `npm run dev`
- [X] Estado
- Resultado esperado: inicia correctamente y carga las rutas principales
- Resultado obtenido:
- Observaciones:

## BUILD-003 - No hay errores de TypeScript
- [X] Estado
- Resultado esperado: no aparecen errores de tipos en build ni editor
- Resultado obtenido: no hay errores
- Observaciones:

## BUILD-004 - No hay errores de ESLint bloqueantes
- [X] Estado
- Resultado esperado: sin errores que frenen build o CI
- Resultado obtenido:
- Observaciones:

## BUILD-005 - Las rutas principales cargan sin error 500
- [ ] Estado
- Resultado esperado: home, users, vacaciones, recibos, legajo cargan correctamente
- Resultado obtenido:
- Observaciones:

---

# 2. Autenticación y permisos

## AUTH-001 - Login válido permite ingresar
- [X] Estado
- Resultado esperado: login exitoso y acceso al dashboard
- Resultado obtenido:
- Observaciones:

## AUTH-002 - Login inválido muestra error correcto
- [x] Estado
- Resultado esperado: mensaje claro y sin ingresar al sistema
- Resultado obtenido:
- Observaciones:

## AUTH-003 - Usuario sin sesión no accede a rutas protegidas
- [ ] Estado
- Resultado esperado: redirección o bloqueo correcto
- Resultado obtenido:
- Observaciones:

## AUTH-004 - Usuario sin permisos no ve botones restringidos
- [ ] Estado
- Resultado esperado: botones ocultos según permiso
- Resultado obtenido:
- Observaciones:

## AUTH-005 - Usuario sin permisos no puede ejecutar APIs protegidas
- [ ] Estado
- Resultado esperado: API responde 403
- Resultado obtenido:
- Observaciones:

## AUTH-006 - Sidebar respeta permisos
- [ ] Estado
- Resultado esperado: solo muestra módulos habilitados
- Resultado obtenido:
- Observaciones:

---

# 3. Usuarios - listado

## USR-LIST-001 - El listado de usuarios carga correctamente
- [ ] Estado
- Resultado esperado: se muestran usuarios sin errores
- Resultado obtenido:
- Observaciones:

## USR-LIST-002 - La búsqueda por nombre funciona
- [ ] Estado
- Resultado esperado: filtra resultados correctos
- Resultado obtenido:
- Observaciones:

## USR-LIST-003 - La búsqueda por userId funciona
- [ ] Estado
- Resultado esperado: encuentra el usuario correcto
- Resultado obtenido:
- Observaciones:

## USR-LIST-004 - La búsqueda por email funciona
- [ ] Estado
- Resultado esperado: encuentra el usuario correcto
- Resultado obtenido:
- Observaciones:

## USR-LIST-005 - La paginación funciona
- [ ] Estado
- Resultado esperado: cambia de página sin romper datos
- Resultado obtenido:
- Observaciones:

## USR-LIST-006 - El ordenamiento funciona
- [ ] Estado
- Resultado esperado: ordena por las columnas permitidas
- Resultado obtenido:
- Observaciones:

## USR-LIST-007 - Estado vacío se muestra correctamente
- [ ] Estado
- Resultado esperado: mensaje claro cuando no hay resultados
- Resultado obtenido:
- Observaciones:

---

# 4. Usuarios - alta

## USR-CREATE-001 - Se puede crear usuario con datos mínimos válidos
- [ ] Estado
- Resultado esperado: usuario creado y persistido
- Resultado obtenido:
- Observaciones:

## USR-CREATE-002 - Se puede crear usuario con todos los campos completos
- [ ] Estado
- Resultado esperado: usuario creado con todos los datos guardados
- Resultado obtenido:
- Observaciones:

## USR-CREATE-003 - Email duplicado muestra error correcto
- [ ] Estado
- Resultado esperado: no crea usuario y muestra mensaje claro
- Resultado obtenido:
- Observaciones:

## USR-CREATE-004 - UserId duplicado muestra error correcto
- [ ] Estado
- Resultado esperado: no crea usuario y muestra mensaje claro
- Resultado obtenido:
- Observaciones:

## USR-CREATE-005 - Documento duplicado muestra error correcto
- [ ] Estado
- Resultado esperado: no crea usuario y muestra mensaje claro
- Resultado obtenido:
- Observaciones:

## USR-CREATE-006 - CUIL duplicado muestra error correcto
- [ ] Estado
- Resultado esperado: no crea usuario y muestra mensaje claro
- Resultado obtenido:
- Observaciones:

## USR-CREATE-007 - El botón guardar no dispara doble submit
- [ ] Estado
- Resultado esperado: una sola request y un solo toast
- Resultado obtenido:
- Observaciones:

---

# 5. Usuarios - edición

## USR-EDIT-001 - Se cargan correctamente los defaultValues
- [ ] Estado
- Resultado esperado: el formulario abre con los datos actuales
- Resultado obtenido:
- Observaciones:

## USR-EDIT-002 - Se puede editar nombre y apellido
- [ ] Estado
- Resultado esperado: cambios guardados correctamente
- Resultado obtenido:
- Observaciones:

## USR-EDIT-003 - Se puede editar email
- [ ] Estado
- Resultado esperado: email actualizado correctamente
- Resultado obtenido:
- Observaciones:

## USR-EDIT-004 - Se puede editar rol
- [ ] Estado
- Resultado esperado: rol actualizado correctamente
- Resultado obtenido:
- Observaciones:

## USR-EDIT-005 - Si password está vacía, no se sobreescribe
- [ ] Estado
- Resultado esperado: la contraseña anterior se mantiene
- Resultado obtenido:
- Observaciones:

## USR-EDIT-006 - Si password se informa, se actualiza
- [ ] Estado
- Resultado esperado: nueva contraseña aplicada
- Resultado obtenido:
- Observaciones:

---

# 6. Formulario de usuario

## USR-FORM-001 - Tabs aceptan solo valores válidos
- [ ] Estado
- Resultado esperado: solo permite tabs soportadas
- Resultado obtenido:
- Observaciones:

## USR-FORM-002 - Fecha de nacimiento no se corre un día
- [ ] Estado
- Resultado esperado: mismo valor en UI, payload y DB
- Resultado obtenido:
- Observaciones:

## USR-FORM-003 - Campos opcionales vacíos no rompen el submit
- [ ] Estado
- Resultado esperado: guarda correctamente con null/undefined según corresponda
- Resultado obtenido:
- Observaciones:

## USR-FORM-004 - Validaciones muestran error correcto
- [ ] Estado
- Resultado esperado: mensaje claro debajo del campo
- Resultado obtenido:
- Observaciones:

## USR-FORM-005 - El primer error recibe foco
- [ ] Estado
- Resultado esperado: focus en el campo inválido
- Resultado obtenido:
- Observaciones:

---

# 7. Import upsert de usuarios

## IMP-001 - Importa usuario nuevo correctamente
- [ ] Estado
- Resultado esperado: crea usuario nuevo
- Resultado obtenido:
- Observaciones:

## IMP-002 - Actualiza usuario existente por email
- [ ] Estado
- Resultado esperado: encuentra y actualiza el usuario correcto
- Resultado obtenido:
- Observaciones:

## IMP-003 - Actualiza usuario existente por userId
- [ ] Estado
- Resultado esperado: encuentra y actualiza el usuario correcto
- Resultado obtenido:
- Observaciones:

## IMP-004 - Actualiza usuario existente por CUIL
- [ ] Estado
- Resultado esperado: encuentra y actualiza el usuario correcto
- Resultado obtenido:
- Observaciones:

## IMP-005 - Revive usuario borrado lógico
- [ ] Estado
- Resultado esperado: reactiva el usuario y actualiza sus datos
- Resultado obtenido:
- Observaciones:

## IMP-006 - `setTemp=1` genera password temporal
- [ ] Estado
- Resultado esperado: devuelve tempPassword y mustChangePassword=true
- Resultado obtenido:
- Observaciones:

## IMP-007 - Si `legajo` es null no rompe
- [ ] Estado
- Resultado esperado: response correcta sin legajo
- Resultado obtenido:
- Observaciones:

## IMP-008 - Fechas importadas no se corren por UTC
- [ ] Estado
- Resultado esperado: mismas fechas en entrada, respuesta y DB
- Resultado obtenido:
- Observaciones:

---

# 8. Legajo / ficha de personal

## LEG-001 - Se puede consultar legajo de un usuario
- [ ] Estado
- Resultado esperado: devuelve legajo correcto o null
- Resultado obtenido:
- Observaciones:

## LEG-002 - Se puede crear legajo
- [ ] Estado
- Resultado esperado: legajo creado correctamente
- Resultado obtenido:
- Observaciones:

## LEG-003 - Se puede actualizar legajo existente
- [ ] Estado
- Resultado esperado: legajo actualizado correctamente
- Resultado obtenido:
- Observaciones:

## LEG-004 - `employeeNumber` guarda número válido
- [ ] Estado
- Resultado esperado: se persiste correctamente
- Resultado obtenido:
- Observaciones:

## LEG-005 - `employmentStatus` acepta solo valores válidos
- [ ] Estado
- Resultado esperado: guarda solo estados soportados
- Resultado obtenido:
- Observaciones:

## LEG-006 - `contractType` acepta solo valores válidos
- [ ] Estado
- Resultado esperado: guarda solo tipos soportados
- Resultado obtenido:
- Observaciones:

## LEG-007 - Matrículas se guardan correctamente
- [ ] Estado
- Resultado esperado: provincial y nacional correctas
- Resultado obtenido:
- Observaciones:

## LEG-008 - Fechas de ingreso/egreso se guardan correctamente
- [ ] Estado
- Resultado esperado: sin corrimiento de fecha
- Resultado obtenido:
- Observaciones:

---

# 9. Importación Excel

## EXCEL-001 - Lee archivo Excel válido
- [ ] Estado
- Resultado esperado: procesa el archivo sin error
- Resultado obtenido:
- Observaciones:

## EXCEL-002 - Convierte serial Excel a fecha correcta
- [ ] Estado
- Resultado esperado: fecha `YYYY-MM-DD` correcta
- Resultado obtenido:
- Observaciones:

## EXCEL-003 - Convierte `dd/mm/yyyy`
- [ ] Estado
- Resultado esperado: fecha normalizada correctamente
- Resultado obtenido:
- Observaciones:

## EXCEL-004 - Convierte `yyyy-mm-dd`
- [ ] Estado
- Resultado esperado: fecha normalizada correctamente
- Resultado obtenido:
- Observaciones:

## EXCEL-005 - Si la celda es inválida devuelve null
- [ ] Estado
- Resultado esperado: no rompe el proceso
- Resultado obtenido:
- Observaciones:

## EXCEL-006 - No hay corrimiento por timezone
- [ ] Estado
- Resultado esperado: misma fecha esperada
- Resultado obtenido:
- Observaciones:

---

# 10. Repositorios y servicios de usuarios

## USR-SVC-001 - `findByEmailOrUserId` funciona con email
- [ ] Estado
- Resultado esperado: encuentra el usuario correcto
- Resultado obtenido:
- Observaciones:

## USR-SVC-002 - `findByEmailOrUserId` funciona con userId
- [ ] Estado
- Resultado esperado: encuentra el usuario correcto
- Resultado obtenido:
- Observaciones:

## USR-SVC-003 - No rompe si email y userId vienen vacíos
- [ ] Estado
- Resultado esperado: responde sin error inesperado
- Resultado obtenido:
- Observaciones:

## USR-SVC-004 - `createOrReviveUser` crea usuario nuevo
- [ ] Estado
- Resultado esperado: alta correcta
- Resultado obtenido:
- Observaciones:

## USR-SVC-005 - `createOrReviveUser` revive usuario borrado lógico
- [ ] Estado
- Resultado esperado: revive correctamente
- Resultado obtenido:
- Observaciones:

## USR-SVC-006 - `handleUserError` mapea ZodError
- [ ] Estado
- Resultado esperado: devuelve mensaje y status 400
- Resultado obtenido:
- Observaciones:

## USR-SVC-007 - `handleUserError` mapea P2002
- [ ] Estado
- Resultado esperado: devuelve 409 con mensaje claro
- Resultado obtenido:
- Observaciones:

---

# 11. Licencias / vacaciones

## VAC-001 - Se puede crear solicitud válida
- [ ] Estado
- Resultado esperado: solicitud creada correctamente
- Resultado obtenido:
- Observaciones:

## VAC-002 - No se puede crear si hay superposición
- [ ] Estado
- Resultado esperado: bloqueo correcto con mensaje claro
- Resultado obtenido:
- Observaciones:

## VAC-003 - No se puede crear si ya hay pendiente
- [ ] Estado
- Resultado esperado: bloqueo correcto con mensaje claro
- Resultado obtenido:
- Observaciones:

## VAC-004 - Admin ve pendientes para aprobación
- [ ] Estado
- Resultado esperado: listado correcto
- Resultado obtenido:
- Observaciones:

## VAC-005 - Cancelar solicitud cambia estado correctamente
- [ ] Estado
- Resultado esperado: estado actualizado
- Resultado obtenido:
- Observaciones:

## VAC-006 - Paginación y filtros funcionan
- [ ] Estado
- Resultado esperado: resultados correctos
- Resultado obtenido:
- Observaciones:

---

# 12. Tabla admin de licencias

## VAC-TABLE-001 - La tabla renderiza lista vacía correctamente
- [ ] Estado
- Resultado esperado: mensaje claro de sin resultados
- Resultado obtenido:
- Observaciones:

## VAC-TABLE-002 - Tooltip de observaciones funciona
- [ ] Estado
- Resultado esperado: muestra nota completa
- Resultado obtenido:
- Observaciones:

## VAC-TABLE-003 - No rompe si `note` viene null
- [ ] Estado
- Resultado esperado: render correcto
- Resultado obtenido:
- Observaciones:

## VAC-TABLE-004 - No rompe si `items` viene como `{ data: [] }`
- [ ] Estado
- Resultado esperado: render correcto
- Resultado obtenido:
- Observaciones:

---

# 13. Recibos / sidebar / tabs

## REC-001 - La sidebar carga documentos correctamente
- [ ] Estado
- Resultado esperado: lista visible y estable
- Resultado obtenido:
- Observaciones:

## REC-002 - La tab Pendientes funciona
- [ ] Estado
- Resultado esperado: cambia de tab correctamente
- Resultado obtenido:
- Observaciones:

## REC-003 - La tab Firmados funciona
- [ ] Estado
- Resultado esperado: cambia de tab correctamente
- Resultado obtenido:
- Observaciones:

## REC-004 - Buscar por período funciona
- [ ] Estado
- Resultado esperado: devuelve documentos correctos
- Resultado obtenido:
- Observaciones:

## REC-005 - Estado vacío muestra mensaje correcto
- [ ] Estado
- Resultado esperado: “No hay documentos”
- Resultado obtenido:
- Observaciones:

## REC-006 - Seleccionar documento resalta el ítem
- [ ] Estado
- Resultado esperado: item activo visible
- Resultado obtenido:
- Observaciones:

---

# 14. PDF stamping

## PDF-001 - Descarga PDF desde Supabase
- [ ] Estado
- Resultado esperado: descarga sin error
- Resultado obtenido:
- Observaciones:

## PDF-002 - Falla correctamente si el PDF no existe
- [ ] Estado
- Resultado esperado: error controlado
- Resultado obtenido:
- Observaciones:

## PDF-003 - Falla correctamente si el PDF no tiene páginas
- [ ] Estado
- Resultado esperado: error controlado
- Resultado obtenido:
- Observaciones:

## PDF-004 - Escribe texto en la primera página
- [ ] Estado
- Resultado esperado: texto visible en coordenadas correctas
- Resultado obtenido:
- Observaciones:

## PDF-005 - `maxWidth` reduce fuente cuando corresponde
- [ ] Estado
- Resultado esperado: texto entra dentro del ancho
- Resultado obtenido:
- Observaciones:

## PDF-006 - Si fontkit falla usa Helvetica
- [ ] Estado
- Resultado esperado: proceso sigue funcionando
- Resultado obtenido:
- Observaciones:

## PDF-007 - El PDF final se sube correctamente
- [ ] Estado
- Resultado esperado: archivo actualizado en storage
- Resultado obtenido:
- Observaciones:

---

# 15. Casos borde

## EDGE-001 - Strings vacíos se convierten correctamente
- [ ] Estado
- Resultado esperado: null / undefined según corresponda
- Resultado obtenido:
- Observaciones:

## EDGE-002 - `null`, `undefined` y `""` no rompen mappers
- [ ] Estado
- Resultado esperado: sin errores
- Resultado obtenido:
- Observaciones:

## EDGE-003 - Usuario sin legajo no rompe vistas
- [ ] Estado
- Resultado esperado: render estable
- Resultado obtenido:
- Observaciones:

## EDGE-004 - Usuario sin rol no rompe render
- [ ] Estado
- Resultado esperado: render estable
- Resultado obtenido:
- Observaciones:

## EDGE-005 - Excel con columnas faltantes muestra error controlado
- [ ] Estado
- Resultado esperado: mensaje claro
- Resultado obtenido:
- Observaciones:

## EDGE-006 - PDF con fuente faltante no rompe el proceso
- [ ] Estado
- Resultado esperado: fallback correcto
- Resultado obtenido:
- Observaciones:

---

# 16. Smoke test rápido

## SMOKE-001 - Login
- [ ] Estado
- Resultado esperado: ingreso correcto
- Resultado obtenido:
- Observaciones:

## SMOKE-002 - Listado de usuarios
- [ ] Estado
- Resultado esperado: carga correctamente
- Resultado obtenido:
- Observaciones:

## SMOKE-003 - Alta usuario
- [ ] Estado
- Resultado esperado: usuario creado
- Resultado obtenido:
- Observaciones:

## SMOKE-004 - Edición usuario
- [ ] Estado
- Resultado esperado: usuario actualizado
- Resultado obtenido:
- Observaciones:

## SMOKE-005 - Legajo
- [ ] Estado
- Resultado esperado: consulta y guardado correctos
- Resultado obtenido:
- Observaciones:

## SMOKE-006 - Import upsert
- [ ] Estado
- Resultado esperado: alta o actualización correcta
- Resultado obtenido:
- Observaciones:

## SMOKE-007 - Licencias
- [ ] Estado
- Resultado esperado: listado y acciones principales correctas
- Resultado obtenido:
- Observaciones:

## SMOKE-008 - Build final
- [ ] Estado
- Resultado esperado: build OK
- Resultado obtenido:
- Observaciones:

---

# Resultado final

## QA general
- [ ] Aprobada
- [ ] Con observaciones
- [ ] Rechazada

## Observaciones finales
- 
- 
- 