// Fetch
fetch('js/catalogo.json')
    .then( (res) => res.json())
    .then( (data) => {

        // Inicializo un usuario invitado o visitante. Al inicio tenemos un visitante y que solo tendra datos fictios.
        let persona_visitante =  new Usuario ("Juan","Perez","5555-5555","Avenida Corrientes 1200")
        let productos = []

        // Añado la info de todos los productos del catalogo.json en el array productos. Tambien vamos mostrando el card de cada producto por html
        data.forEach((producto) => {
            objProducto =  new Producto(producto.codigo,producto.nombre,producto.descripcion,producto.precio,producto.ruta)
            productos.push(objProducto)
            hacerHTMLProducto(objProducto)
        });

        // Una vez que tengo los productos cargados en mi array productos. Prodecedmos a inicializar el carrito. Aca tenemos dos opciones. O el carrito empieza en cero o el carrito recupera informacion del storage (Tambien recuperacion datos del usuario desde storage)
        inicializarCarrito(persona_visitante,productos)

        // Damos acciones a cada card de un producto
        productos.forEach((producto) => {
            hacerAcciones(persona_visitante, producto, productos)
        });

        // Realizamos los HTML y damos accion de cada boton.
        hacerHTMLOffcanvasCarrito(persona_visitante, productos)
        hacerHTMLOffcanvasUsuario(persona_visitante)
        hacerAccionModal(persona_visitante)
    })
    .catch( (error) => {
        // En caso de que tengamos un error en la carga de datos. Mostraremos un cartel de error en nuestro html
        const inicio = document.getElementById("inicio")
        const tituloProducto = document.getElementById("tituloProducto")
        inicio.classList.add("esconder")
        tituloProducto.innerHTML = "<h1>Tenemos un problema :( </h1><h4>Algunas secciones y botones del sitio, no estarian funcionando correctamente.</h4><h5>Contacte con el administrador del sitio</h5>"
        console.log(error)
    })


// Pequeño codigo para el modal modalCompra. Si tocamos fuera de la pantalla, hacemos que el modal se cierre.
window.onclick = function(event) {
    if (event.target == modalCompra) {
        modalCompra.style.display = "none";
    }
}

// Clases

class Usuario{
    constructor(nombre,apellido,telefono,domicilio){

        this.nombre = nombre
        this.apellido = apellido
        this.telefono = telefono
        this.domicilio = domicilio
        
        // Informa si el carrito contiene elementos
        this.carrito = false

        // Inicializo el carrito
        this.contenidoCarrito = []

        // Inicializa el monto total
        this.monto_total = 0

    }

    // Getters
    getnombre(){ return this.nombre }
    getapellido(){ return this.apellido }
    gettelefono(){ return this.telefono }
    getdomicilio(){ return this.domicilio }
    getcarrito(){ return this.carrito }
    getcontenidocarrito(){ return this.contenidoCarrito }
    getmonto_total(){ return this.monto_total }

    // Setters
    setnombre(valor){ this.nombre = valor }
    setapellido(valor){ this.apellido = valor }
    settelefono(valor){ this.telefono = valor }
    setdomicilio(valor){ this.domicilio = valor }
    setcarrito(valor){ this.carrito = valor }
    setcontenidocarrito(valor){this.contenidoCarrito = valor}
    setmonto_total(valor){ this.monto_total = valor }

    // Metodos
    sumarProducto(id,cantidad){
        for (let index = 0; index < this.contenidoCarrito.length; index++) {
            if(this.contenidoCarrito[index].id === id){
                this.contenidoCarrito[index].cantidad += cantidad
            }    
        }
    }

    quitarProducto(id,cantidad){
        for (let index = 0; index < this.contenidoCarrito.length; index++) {
            if(this.contenidoCarrito[index].id === id){
                const resultado = this.contenidoCarrito[index].cantidad - cantidad
                this.contenidoCarrito[index].cantidad = resultado < 0 ? 0 : resultado
            }    
        }
    }

    totalProducto(id){
        for (let index = 0; index < this.contenidoCarrito.length; index++) {
            if(this.contenidoCarrito[index].id === id){
                return (this.contenidoCarrito[index].cantidad * this.contenidoCarrito[index].precio)
            }    
        }
    }

    actualizarMontoTotal(){
        let acumulador = 0

        for (let index = 0; index < this.contenidoCarrito.length; index++) {
            acumulador += this.contenidoCarrito[index].precio * this.contenidoCarrito[index].cantidad
        }

        // Validador del carrito si contiene productos
        this.carrito = acumulador!=0 ? true : false

        // Sumo el monto total
        this.monto_total = acumulador
    }

    almacenarCarrito(){
        const carritoJSON = JSON.stringify(this.contenidoCarrito)
        localStorage.setItem("carrito",carritoJSON)
    }

    almacenarUsuario(){
        let usuario = [this.nombre,this.apellido,this.domicilio,this.telefono]
        const usuarioJSON = JSON.stringify(usuario)
        localStorage.setItem("usuario",usuarioJSON)
    }

    actualizarCarrito(){
        let llave = "carrito"
        const carrito = JSON.parse( localStorage.getItem(llave))
        if(carrito){
            this.contenidoCarrito = carrito
        }
    }

    actualizarUsuario(){
        let llave = "usuario"
        const usuario = JSON.parse(localStorage.getItem(llave))
        if(usuario){
            this.nombre = usuario[0]
            this.apellido = usuario[1]
            this.domicilio = usuario[2]
            this.telefono = usuario[3]
        }
    }

    cantidadProductosEnElCarrito(){
        let acumulador = 0
        for (let index = 0; index < this.contenidoCarrito.length; index++) {
            acumulador += this.contenidoCarrito[index].cantidad
        }
        return acumulador
    }
}

class Producto{

    constructor(id,nombre,descripcion,precio,rutaImagen){
        this.id = id
        this.nombre = nombre
        this.descripcion = descripcion
        this.precio = precio
        this.rutaImagen = rutaImagen
    }

    // Getters
    getid(){return this.id}
    getnombre(){return this.nombre}
    getdescripcion(){return this.descripcion}
    getprecio(){return this.precio}
    getrutaImagen(){return this.rutaImagen}

    // Setters
    setid(){return this.id}
    setnombre(valor){ this.nombre = valor }
    setdescripcion(valor){ this.descripcion = valor }
    setprecio(valor){ this.precio = valor }
    setrutaImagen(valor){ this.rutaImagen = valor }
}

// Funciones

/* 
inicializarCarrito(usuario,productos) - Se encarga de inicializar el carrito con cero productos o bien podemos recuperar la informacion del carrito o datos de usuario desde el storage.  
*/
async function inicializarCarrito(usuario,productos){
    let usuario_visitante = await usuario
    let array_carrito = []
    for(let index = 0; index < productos.length; index++){
        array_carrito.push({
            id: productos[index].getid(),
            nombre: productos[index].getnombre(),
            precio: productos[index].getprecio(),
            cantidad: 0
        })
    }
    usuario_visitante.setcontenidocarrito(array_carrito)
    usuario_visitante.actualizarCarrito()
    usuario_visitante.actualizarUsuario()
    usuario_visitante.actualizarMontoTotal()
    hacerNotificacionCarrito(usuario_visitante)
}

/* 
hacerHTMLProducto(producto) - Dado un producto, mostraremos el card de este producto, junto con la informacion, imagen y titulo del producto. En el card añadimos boton de añadir carrito y una pequeña interfaz junto con input para añadir mas cantidades de un producto. 
*/
function hacerHTMLProducto(producto){
    let container_productosLista = document.getElementById("productosLista")
    
    container_productosLista.innerHTML += `
    <div class="col pb-4">
        <div class="card shadow text-center" id="producto${producto.getid()}">
        </div>
    </div>`
    
    let container_producto = document.getElementById("producto"+producto.getid())   
     
    // Añadimos el titulo del producto
    container_producto.innerHTML += `<div class="card-header producto_titulo">${producto.getnombre()}</div>`

    // Añadimos la imagen del producto 
    container_producto.innerHTML += `<img src="${producto.getrutaImagen()}" class="card-img-top">` 

    // Añadimos la descripcion del producto
    container_producto.innerHTML += `
    <div class="card-body">
        <p class="card-text cajaDescripcion">${producto.getdescripcion()}</p>
        <h3 class="card-title color_texto--cobre fw-bolder">$ ${producto.getprecio()}</h3>
    </div>` 

    container_producto.innerHTML += `
    <form id="frm${producto.getid()}">
        <div class="card-footer text-muted">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col pt-1">
                        <h6>Cantidad</h6>
                    </div>
                    <div class="col">
                        <div class="btn-group btn-group-sm" role="group">
                            <button type="button" class="btn btn-secondary" id="quitarProducto${producto.getid()}"><i class="bi bi-dash"></i></button>
                            <input type="text" class="form-control form-control-sm text-center" value="0" id="cantidadProducto${producto.getid()}">
                            <button type="button" class="btn btn-secondary" id="agregarProducto${producto.getid()}"><i class="bi bi-plus"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="card-footer text-muted">
            <div class="d-grid gap-2">
                <input type="button" class="btn btn-secondary" value="Añadir al Carrito" id="carritoProducto${producto.getid()}">
            </div>
        </div>
    </form>
    ` 
}

/* 
hacerAcciones(usuario, producto, productos) - Daremos accion a los botones del card producto
*/
async function hacerAcciones(usuario, producto, productos){
    const botonQuitarProducto = document.getElementById("quitarProducto"+producto.getid())
    const botonAgregarProducto = document.getElementById("agregarProducto"+producto.getid())
    const botonCarritoProducto = document.getElementById("carritoProducto"+producto.getid())
    const cantidadProducto = document.getElementById("cantidadProducto"+producto.getid())
    let usuario_visitante = await usuario

    // BotonQuitarProducto
    botonQuitarProducto.onclick = function(){
        cantidadProducto.value!=0 && cantidadProducto.value--
    }

    // BotonAgregarProducto
    botonAgregarProducto.onclick = function(){
        cantidadProducto.value++
    }

    // BotonAñadirCarrito
    botonCarritoProducto.onclick = function(){
        const alert = document.getElementById("alert")

        if(cantidadProducto.value<=0){
            Toastify({
                text: "Por favor, añadir un producto antes de agregarlo al carrito.",
                duration: 3000,
                gravity: "bottom",
                position: "center",
                style: {
                    background: "linear-gradient(360deg, rgb(176 21 4), rgb(79 19 3 / 91%), rgb(175 20 3))"
                }
            }).showToast();
        }
        else{

            // Añado el producto al carrito

            usuario_visitante.sumarProducto(producto.getid(),parseInt(cantidadProducto.value))
            usuario_visitante.almacenarCarrito()
            usuario_visitante.actualizarMontoTotal()
            hacerHTMLCarrito(usuario_visitante,productos)

            Toastify({
                text: "Producto añadido al carrito.",
                duration: 3000,
                gravity: "bottom",
                position: "center",
                style: {
                    "background": "linear-gradient(360deg, rgb(210, 165, 104), rgb(237 127 27), rgb(166, 106, 18))",
                    "text-shadow": "1px 1px 10px black"
                }
            }).showToast();
        }

        // Añado el producto en la notificacion del carrito
        cantidadProductoCarrito.innerText = usuario_visitante.cantidadProductosEnElCarrito()
        cantidadProductoCarrito.classList.remove("esconder")

        // Reset cantidad de producto
        cantidadProducto.value = 0
    }
}

/* 
hacerHTMLCarrito(usuario,productos) - Se encarga de realizar parte del HTML del offcanvas carrito. En caso de que el carrito contenga elementos, listara los productos del carrito. Tambien le damos accion al boton trash (elimina un producto del carrito)
*/
async function hacerHTMLCarrito(usuario,productos){
    const container_offcanvasCarrito = document.getElementById("container_offcanvasCarrito")
    const container_offcanvasTotal = document.getElementById("container_offcanvasTotal")
    const montoTotal = document.getElementById("montoTotal")
    const botonComprar = document.getElementById("containerComprar")
    let usuario_visitante = await usuario

    if(usuario_visitante.getcarrito()){
    
        // Inicio Tabla HTML
        let codigo_html = `
        <table class="table text-center">
            <thead>
                <tr>
                    <th class="col-1 text-start"></th>
                    <th class="col-6 text-start">Producto</th>
                    <th class="col-1">Unidad</th>
                    <th class="col-3">Total</th>
                    <th class="col-1"></th>
                </tr>
            </thead>
            <tbody class="fw-light align-middle">`

        // Escribir HTML de un producto del carrito
        const contenidoCarrito = usuario_visitante.getcontenidocarrito()

        for (let index = 0; index < contenidoCarrito.length; index++) {
            if(contenidoCarrito[index].cantidad!=0){

                const id_producto = contenidoCarrito[index].id

                // Buscar el producto dado un id
                for(const p of productos){
                    if(p.getid()==id_producto){
                        const producto = p
                        codigo_html += ` 
                        <tr>
                            <td>
                                <img src="${producto.getrutaImagen()}" style="width: 50px">
                            </td>
                            <td class="text-start">${producto.getnombre()}</td>
                            <td>${contenidoCarrito[index].cantidad}</td>
                            <td>${usuario_visitante.totalProducto(contenidoCarrito[index].id)} $</td>
                            <td class="px-4"><button type="button" class="btn btn-secondary btn-sm" id="trash${contenidoCarrito[index].id}"><i class="bi bi-trash-fill"></i></button></td>
                        </tr>`
                    }
                }
            }
        }

        // Cierro Tabla HTML
        codigo_html += `
            </tbody>
        </table>`

        container_offcanvasCarrito.innerHTML = codigo_html

        // Accion del boton borrarProducto
        for (let index = 0; index < contenidoCarrito.length; index++) {
            if(contenidoCarrito[index].cantidad!=0){
                let botonTrash = document.getElementById("trash"+contenidoCarrito[index].id)
                botonTrash.onclick = function(){
                    usuario_visitante.quitarProducto(contenidoCarrito[index].id,contenidoCarrito[index].cantidad)
                    usuario_visitante.almacenarCarrito()
                    usuario_visitante.actualizarMontoTotal()

                    // Modificamos el badge del boton carrito en funcion a la cantidad
                    if(usuario_visitante.cantidadProductosEnElCarrito()!=0){
                        cantidadProductoCarrito.classList.remove("esconder")
                        cantidadProductoCarrito.innerText = usuario_visitante.cantidadProductosEnElCarrito()
                    }
                    else{
                        cantidadProductoCarrito.classList.add("esconder")
                    }

                    hacerHTMLCarrito(usuario_visitante,productos)

                    Toastify({
                        text: "Se borro un producto del carrito.",
                        duration: 3000,
                        gravity: "bottom",
                        position: "center",
                        style: {
                            background: "linear-gradient(360deg, rgb(176 21 4), rgb(79 19 3 / 91%), rgb(175 20 3))"
                        }
                    }).showToast();
                    
                }
            }
        }
        
        container_offcanvasCarrito.className = "container pt-1 px-4 overflow-auto overflow_offcanvas"
        container_offcanvasTotal.className = "container pt-1 px-4"
        montoTotal.innerText= usuario_visitante.monto_total+" $"
        botonComprar.className = "row justify-content-md-center py-2"
    }
    else{
        container_offcanvasCarrito.innerHTML = `
        <div class="alert text-center" role="alert">
            <h5 class="alert-heading fw-bolder">¡ El carrito esta vacio !</h5>
            <hr>
            <p class="mb-0">Actualmente, no hay productos dentro del carrito.</p>
        </div>`
        container_offcanvasCarrito.className = "container pt-1 px-4 overflow-auto"
        container_offcanvasTotal.className = "container esconder pt-1 px-4"
        botonComprar.className = "row justify-content-md-center py-2 esconder"
    }
}

/* 
hacerHTMLOffcanvasCarrito(usuario,productos) - Realiza acciones del boton carrito y cerrar
*/
async function hacerHTMLOffcanvasCarrito(usuario,productos){
    const botonCarrito = document.getElementById("botonCarrito") 
    const containerOffcanvasCarrito = document.getElementById("offcanvasCarrito") 
    const botonCerrarOffcanvasCarrito = document.getElementById("close_offcanvasCarrito") 
    let usuario_visitante = await usuario

    botonCarrito.onclick = function() {
        containerOffcanvasCarrito.classList.toggle("esconder")
        hacerHTMLCarrito(usuario_visitante,productos)
    }
    
    botonCerrarOffcanvasCarrito.onclick = function(){
        containerOffcanvasCarrito.className = "esconder offcanvasCarrito"
    }
}

/* 
hacerHTMLOffcanvasUsuario(usuario) - Realiza el HTML para el offcanvas usuario. Mostra los inputs de los datos del usuario para asi poder modificarlo, en caso que el usuario lo desee. Ademas le damos acciones a los botones que contiene el offcanvas usuario (botonDatosUsuario, botonCerrarOffcanvasUsuario, botonActualizarDatos). En el boton botonActualizarDatos realizamos una validacion de datos. Validamos que todos los campos contengan informacion. (Los datos del usuario no pueden estar vacios)
*/
async function hacerHTMLOffcanvasUsuario(usuario){
    const botonDatosUsuario = document.getElementById("botonDatosUsuario")
    const containerOffcanvasUsuario = document.getElementById("offcanvasUsuario")
    const botonCerrarOffcanvasUsuario = document.getElementById("close_offcanvasUsuario") 
    const botonActualizarDatos = document.getElementById("actualizarDatos")
    let usuario_visitante = await usuario

    botonDatosUsuario.onclick = function(){
        containerOffcanvasUsuario.classList.toggle("esconder")
        hacerHTMLUsuario(usuario_visitante)
    }

    botonCerrarOffcanvasUsuario.onclick = function(){
        containerOffcanvasUsuario.className = "esconder offcanvasUsuario"
    }

    botonActualizarDatos.onclick = function(){
        const campoNombre = document.getElementById("nombre")
        const campoApellido = document.getElementById("apellido")
        const campoDomicilio = document.getElementById("domicilio")
        const campoTelefono = document.getElementById("telefono")
        let error = false

        // Validador de campos

        if(campoNombre.value === "" ){
            const spanNombre = document.getElementById("spanNombre")
            spanNombre.classList.remove("esconder")
            error = true
        }

        if(campoApellido.value === ""){
            const spanApellido = document.getElementById("spanApellido")
            spanApellido.classList.remove("esconder")
            error = true
        }

        if(campoDomicilio.value === ""){
            const spanDomicilio = document.getElementById("spanDomicilio")
            spanDomicilio.classList.remove("esconder")
            error = true
        }

        if(campoTelefono.value === ""){
            const spanTelefono = document.getElementById("spanTelefono")
            spanTelefono.classList.remove("esconder")
            error = true
        }

        // Notificacion alert y guardado de datos

        if(error){

            Toastify({
                text: "Por favor, completar los campos faltantes.",
                duration: 3000,
                gravity: "bottom",
                position: "center",
                style: {
                    "background": "linear-gradient(360deg, rgb(176 21 4), rgb(79 19 3 / 91%), rgb(175 20 3))"
                }
            }).showToast();

        }
        else{
            usuario_visitante.setnombre(campoNombre.value)
            usuario_visitante.setapellido(campoApellido.value)
            usuario_visitante.setdomicilio(campoDomicilio.value)
            usuario_visitante.settelefono(campoTelefono.value)
            usuario_visitante.almacenarUsuario()

            Toastify({
                text: "Los datos del usuario han sido actualizados.",
                duration: 5000,
                gravity: "bottom",
                position: "center",
                style: {
                    "background": "linear-gradient(360deg, rgb(210, 165, 104), rgb(237 127 27), rgb(166, 106, 18))",
                    "text-shadow": "1px 1px 10px black"
                }
            }).showToast();  

        }
    }
}

/* 
hacerHTMLUsuario(usuario) - Realiza parte del HTML para el offcanvas usuario. Muestra los inputs de cada dato del usuario.
*/
async function hacerHTMLUsuario(usuario){
    const container = document.getElementById("container_offcanvasUsuario")
    let usuario_visitante = await usuario

    container.innerHTML = `
    <div class="row pt-1">
        <div class="col-6">
            <label for="nombre" class="form-label color_texto--cobre fw-bolder">Nombre<span class="esconder spanUsuario" id="spanNombre">(Completar campo)</span></label>
            <input type="text" class="form-control" id="nombre" placeholder="" value="${usuario_visitante.getnombre()}" required="">
        </div>
        <div class="col-6">
            <label for="apellido" class="form-label color_texto--cobre fw-bolder">Apellido<span class="esconder spanUsuario" id="spanApellido">(Completar campo)</span></label>
            <input type="text" class="form-control" id="apellido" placeholder="" value="${usuario_visitante.getapellido()}" required="">
        </div>
    </div>
    <div class="row py-3">
        <div class="col-12">
            <label for="nombre" class="form-label color_texto--cobre fw-bolder">Domicilio<span class="esconder spanUsuario" id="spanDomicilio">(Completar campo)</span></label>
            <input type="text" class="form-control" id="domicilio" placeholder="" value="${usuario_visitante.getdomicilio()}" required="">
        </div>
    </div>
    <div class="row pb-3">
        <div class="col-12">
            <label for="nombre" class="form-label color_texto--cobre fw-bolder">Telefono<span class="esconder spanUsuario" id="spanTelefono">(Completar campo)</span></label>
            <input type="text" class="form-control" id="telefono" placeholder="" value="${usuario_visitante.gettelefono()}" required="">
        </div>
    </div>`
}

/* 
hacerAccionModal(usuario) - Realiza las acciones del botonComprar y confirmarCompra
*/
async function hacerAccionModal(usuario){
    const botonComprar = document.getElementById("comprar")
    const modalCompra = document.getElementById("modalCompra")
    let usuario_visitante = await usuario

    botonComprar.onclick = function(){
        hacerHTMLConfirmarCompra(usuario_visitante)
        modalCompra.style.display = "block"

        // Accion del boton cerrar
        const cerrarModal = document.getElementById("cerrarModal")
        if(cerrarModal!=null){
            cerrarModal.onclick = () => modalCompra.style.display = "none"
        }

        // Accion del boton confirmar
        const confirmarComprar = document.getElementById("confirmarComprar")
        confirmarComprar.onclick = function(){

            Toastify({
                text: "Gracias por su comprar! Su pedido le llegara al domicilio ("+usuario_visitante.getdomicilio()+") en los proximos dias",
                duration: 5000,
                gravity: "bottom",
                position: "center",
                style: {
                    background: "linear-gradient(360deg, rgb(210, 165, 104), rgb(237 127 27), rgb(166, 106, 18))"
                }
            }).showToast();        

            modalCompra.style.display = "none"
        }
    }
}

/* 
hacerHTMLConfirmarCompra(usuario_visitante) - Realiza el HTML para el modalCompra, mostrando la informacion de los productos y los datos del usuario en forma de lista. 
*/
function hacerHTMLConfirmarCompra(usuario_visitante){
    const modalCompra = document.getElementById("modalCompra")
    const carrito = usuario_visitante.getcontenidocarrito()

    let html = `
    <div class="container containerModal">
        <div class="row">
            <div class="col-1">
                <button type="button" class="btn-close" aria-label="Close" id="cerrarModal"></button>
            </div>
            <div class="col-10">
                <h5 class="text-center fw-bold color_texto--cobre">Detalle de su compra</h5>
            </div>
        </div>
        <div class="row">
            <div class="container pt-1 px-4">
                <table class="table text-center">
                    <thead>
                        <tr>
                            <th class="col-1">ID</th>
                            <th class="col-6 text-start">Producto</th>
                            <th class="col-1">Unidad</th>
                            <th class="col-1"></th>
                            <th class="col-1">Precio</th>
                            <th class="col-2">Total</th>
                        </tr>
                    </thead>
                    <tbody class="fw-light">`

    // Añadimos los productos del carrito al detalle de la compra

    for (let index = 0; index < carrito.length; index++){
        if(carrito[index].cantidad!=0){
            html += `
            <tr>
                <td>${carrito[index].id}</td>
                <td class="text-start">${carrito[index].nombre}</td>
                <td>${carrito[index].cantidad}</td>
                <td>x</td>
                <td>${carrito[index].precio}</td>
                <td>${usuario_visitante.totalProducto(carrito[index].id)} $</td>
            </tr>`
        }
    }

    // Cerramos la tabla y completamos con los datos del usuario

    html += `
                    </tbody>
                </table>
                <table class="table table-light text-center">
                    <thead>
                        <tr>
                            <th class="col-10 text-start">Total a Pagar</th>
                            <th class="col-2">${usuario_visitante.getmonto_total()} $</th>
                        </tr>
                    </thead>
                </table>   
            </div>
        </div>
        <div class="row">
            <h6 class="px-4 py-2">Antes de continuar con su compra. Necesitamos que valide sus datos personales:</h6>
            <div class="container pt-1 px-4" id="">
                <table class="table text-center">
                    <thead>
                        <tr>
                            <th class="col-2">Nombres</th>
                            <th class="col-2">Apellido</th>
                            <th class="col-6 text-start">Domicilio</th>
                            <th class="col-2">Telefono</th>
                        </tr>
                    </thead>
                    <tbody class="fw-light"> 
                        <tr>
                            <td>${usuario_visitante.getnombre()}</td>
                            <td>${usuario_visitante.getapellido()}</td>
                            <td class="text-start">${usuario_visitante.getdomicilio()}</td>
                            <td>${usuario_visitante.gettelefono()}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="row justify-content-md-center py-2">
            <div class="col-md-auto">
                <button class="btn btn-secondary" id="confirmarComprar">Confirmar Compra</button>
            </div>
        </div>
    </div>
    `
    modalCompra.innerHTML = html
}

/* 
hacerNotificacionCarrito(usuario) - Solo se encarga de mostrar la informacion del boton carrito en forma de notificacion. Muestra la cantidad de productos que contiene el carrito. En caso que el carrito este vacio. La notificacion no aparece. 
*/
function hacerNotificacionCarrito(usuario){
    const cantidadProductoCarrito = document.getElementById("cantidadProductoCarrito")
    if(usuario.cantidadProductosEnElCarrito()!=0){
        cantidadProductoCarrito.classList.remove("esconder")
        cantidadProductoCarrito.innerText = usuario.cantidadProductosEnElCarrito()
    }
    else{
        cantidadProductoCarrito.classList.add("esconder")
    }
}
