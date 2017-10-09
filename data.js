// TODO: crear un parser de json.
var all_ramos = {
	s1: [new Ramo('Matemáticas I', 'MAT-021', 5, 'PC'),
		new Ramo('Programación', 'IWI-131', 3, 'FI'),
		new Ramo('Introducción a la Física', 'FIS-100', 3, 'PC'),
		new Ramo('Humanístico I', 'HRW-132', 2, 'HUM'),
		new Ramo('Educación Física I', 'DEW-100', 1, 'HUM')
	],
	s2: [new Ramo('Química y Sociedad', 'QUI-010', 3, 'PC'),
		new Ramo('Matemáticas II', 'MAT-022', 5, 'PC', ['MAT-021']),
		new Ramo('Física General I', 'FIS-110', 3, 'PC'),
		new Ramo('Introducción a la Ingeniería', 'IWG-101', 2, 'TIN'),
		new Ramo('Humanístico II', 'HRW-133', 1, 'HUM'),
		new Ramo('Educación Física II', 'DEW-101', 1, 'HUM')
	],
	s3: [new Ramo('Estructuras de Datos', 'INF-134', 3, 'FI'),
		new Ramo('Matemáticas III', 'MAT-023', 4, 'PC'),
		new Ramo('Física General III', 'FIS-130', 4, 'PC'),
		new Ramo('Estructuras Discretas', 'INF-152', 3, 'FI'),
		new Ramo('Teoría de Sistemas', 'INF-260', 3, 'SD'),
		new Ramo('Libre I', 'INF-1', 1, 'HUM')
	],
	s4: [
		new Ramo('Lenguajes de Programación', 'INF-253', 3, 'FI'),
		new Ramo('Matemáticas IV', 'MAT-024', 4, 'PC'),
		new Ramo('Física General II', 'FIS-120',  4, 'PC'),
		new Ramo('Informática Teórica', 'INF-155', 3, 'FI'),
		new Ramo('Economía IA', 'IWN-170', 3, 'IND'),
		new Ramo('Libre II', 'INF-2', 1, 'HUM')
	],
	s5: [
		new Ramo('Bases de Datos', 'INF-239', 3, 'IS'),
		new Ramo('Arquitectura y Organización de Computadores', 'INF-245', 3, 'TIC')
	],
};
