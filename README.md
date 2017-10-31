# Ramos SVG
Generador de la malla (por ahora de Informática) que permitirá
visualizar los ramos aprobados.

# TODO
* [ ] Almacenar los ramos aprobados en caché
* [ ] Generalizar el `JSON`, en lo posible agregar compatibilidad con `CSV`
* [ ] Comentar código, limpiarlo.
* [ ] Disfrutar un buen café.

## Aportar
```json
"s2": [["Química y Sociedad", "QUI-010", 3, "PC"],
		["Matemáticas II", "MAT-022", 5, "PC", ["MAT-021"]],
		["Física General I", "FIS-110", 3, "PC", ["MAT-021", "FIS-100"]],
		["Introducción a la Ingeniería", "IWG-101", 2, "TIN"],
		["Humanístico II", "HRW-133", 1, "HUM"],
		["Educación Física II", "DEW-101", 1, "HUM", ["DEW-100"]]
	]
```
Para modificar el JSON, se debe saber lo siguiente:

`s2` Corresponde al semestre, en este caso, Semestre II. Es una lista con 5 objetos:
1. *Ramo*: El nombre completo del ramo.
2. *Sigla*: Sigla del ramo. Este campo es importante, ya que con éstos se calculan los prerrequisitos.
3. *Créditos*: Entero, la cantidad de créditos.
4. *Sector*: Sector del ramo al que pertenece (por ejemplo, *PC*: Plan Común), falta exportar la configuración de los colores.
5. *Prerrequisitos*: Una lista de strings que contiene los prerrequisitos del ramo. Es **importante**
que la sigla ya exista, de lo contrario podría fallar.

Se aceptan Fork requests para agregar carreras, pronto se incorporará la selección de carrera
