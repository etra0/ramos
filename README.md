# Este proyecto no se encuentra actualmente en mantención.
Hay un fork activo que es mantenido por otra persona [En este enlace](https://github.com/CsarMan/malla-interactiva)

# Ramos SVG
Generador de la malla que permitirá
visualizar los ramos aprobados.

# ¡Novedades!

- ¡Ahora podras calcular tu prioridad usando la malla de tu carrera!  
![Gif demo de calculo de prioridad](https://media.giphy.com/media/9FZo5ua3aCmXij4xZ5/giphy.gif)
- ¿Quieres planear tu estadía en la U? ¡Crea una malla personalizada basada en una pre-existente!  
![Gif demo de la malla personalidada](https://media.giphy.com/media/QK448lB7juUF0ftL7g/giphy.gif)  
¡Soporta hasta *20* semestres! (En caso de ser necesario, el límite puede expandirse)

- Si por alguna razón un ramo no esta en tu malla, ¡es muy facil agregar una!  
![Imagen de ventana para agregar un Ramo](https://i.imgur.com/NnCAaP2.png)
![Imagen de tabla de ramos que están fuera de la malla](https://i.imgur.com/li2TRD7.png)

# TODO
* [x] Almacenar los ramos aprobados en caché
* [x] Generalizar el `JSON`, en lo posible agregar compatibilidad con `CSV`
* [ ] **Comentar código, limpiarlo.**
* [x] Disfrutar un buen café.
 


## Aportar

Para aportar, en la carpeta `data` se tienen dos ficheros por cada
carrera, estos son  `data_CARR.json` y `colors_CARR.json`. Se deben
crear ambos jsons (se pueden usar los existentes como base) para agregar
una carrera a la malla interactiva.

Un ejemplo de un semestre en `data_CARR.json` sería:

```json
"s2": [["Química y Sociedad", "QUI-010", 3, "PC"],
		["Matemáticas II", "MAT-022", 5, "PC", ["MAT-021"]],
		["Física General I", "FIS-110", 3, "PC", ["MAT-021", "FIS-100"]],
		["Introducción a la Ingeniería", "IWG-101", 2, "TIN"],
		["Humanístico II", "HRW-133", 1, "HUM"],
		["Educación Física II", "DEW-101", 1, "HUM", ["DEW-100"]]
	]
```
Para modificar el JSON se debe saber lo siguiente:

`s2` Corresponde al semestre, en este caso, Semestre II. Es una lista con 5 objetos:
1. *Ramo*: El nombre completo del ramo.
2. *Sigla*: Sigla del ramo. Este campo es importante, ya que con éstos se calculan los prerrequisitos.
3. *Créditos*: Entero, la cantidad de créditos.
4. *Sector*: Sector del ramo al que pertenece (por ejemplo, *PC*: Plan Común), se deben agregar ó editar en el json `colors_CARR.json`.
5. *Prerrequisitos*: Una lista de strings que contiene los prerrequisitos del ramo. Es **importante**
que la sigla ya exista, de lo contrario podría fallar. Esta lista es opcional.

El json `colors_CARR.json` debe tener el formato

```json
{
	"SIGLA": ["COLOR", "pequeña descripcion"],
}
```

Ejemplo:

```json
{
	"PC": ["#00838F", "Plan Común"],
	...
}
```

## Probar malla
Para probar la malla, existen dos metodos:

### Usando python (preferido)
Lo ideal sería probarlo usando python, ya que permite levantar un mini servidor http lo que facilita la carga
para el navegador. Para esto, se tiene que abrir una terminal, ir al directorio principal de la malla (ramos/)
y ejecutar lo siguiente:

* Si tiene Python 2 (el usado en la universidad): `python -m SimpleHTTPServer`
* Si tiene Python 3 (el actual): `python -m http.server`

Independiente de la version, una vez ejecutado la linea, despues se debe abrir un navegador
e ir a la dirección http://localhost:8000 y ahí debería ver la malla.
Dependiendo de la malla a probar, deberá navegar agregando al final de la url `?m=CARR`. Por ejemplo, 
para abrir `data_INF.json` debería quedar algo como `http://localhost:8000/index.html?m=INF`.

### Usando Firefox
Se tiene que abrir el `index.html` con **Firefox** (debido a que los otros navegadores tienen
desactivada la lectura de archivos locales por defecto), y al final de la URL agregar `?m=CARR`. Por ejemplo, 
para abrir `data_INF.json` debería quedar algo como `index.html?m=INF`.

Se aceptan Pull Requests para agregar carreras.

---
# Gracias

Se agradece especialmente a:

* CEE de ELO por agregar su respectiva malla
* [Manizuca](https://github.com/Manizuca) por agregar la malla de TEL
* Fernando Cardenas por agregar la malla de ICOM
* Abel Morgenstern  por agregar la malla de CIV
* Bernardo Recabarren por agregar la malla de MAT
