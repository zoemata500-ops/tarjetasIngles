async function pedirPalabra() {
  const respuesta = await fetch("https://api.dictionaryapi.dev/api/v2/entries/en/hello");
   if ( respuesta.ok ){
    console.log(respuesta.status);
  const datos = await respuesta.json();
  console.log(datos[0].word);
  console.log(datos[0].meanings[0].definitions[0].definition);
  // console.dir(datos,{ depth: null });
  
   }else {
    console.log('no se encontró la palabra')
    console.log(respuesta.status);
   }

}

pedirPalabra ();
console.log("Esto va después de la llamada");

