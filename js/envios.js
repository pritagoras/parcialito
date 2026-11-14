// Envío voluntario y privado de imágenes a Parcialito.
const BASE='https://tnpcvmnwuhsxdxvwxvlh.supabase.co';
const KEY='sb_publishable_UXVhm9cko_YZm3GrAUBRyg_YSIfM03O';
const BUCKET='parcialito-envios';
const MAX_BYTES=8*1024*1024;
const MAX_FILES=6;
const headers={'apikey':KEY,'Content-Type':'application/json'};
async function request(path,options={}){const r=await fetch(BASE+path,{...options,headers:{...headers,...(options.headers||{})}});if(!r.ok)throw new Error((await r.text().catch(()=>''))||('Error '+r.status));return r.status===204?null:r.json().catch(()=>null);}
const safe=s=>String(s||'').trim().slice(0,80);
export function abrirEnvioImagenes({avisar=()=>{}}={}){
  document.getElementById('modal-envio-imagenes')?.remove();
  const modal=document.createElement('div');modal.id='modal-envio-imagenes';modal.className='envio-overlay';
  modal.innerHTML=`<section class="envio-dialog" role="dialog" aria-modal="true" aria-labelledby="envio-titulo">
    <button class="envio-cerrar" type="button" aria-label="Cerrar">×</button>
    <div class="envio-kicker">BUZÓN DE PARCIALITO</div><h2 id="envio-titulo">¡Se vienen imágenes!</h2>
    <p>De tus apuntes, de tu gato, memes, dibujos o cualquier cosa que quieras compartir. Elegís qué mandar: <b>no se sube nada sin que lo selecciones y confirmes.</b></p>
    <form id="form-envio-imagenes">
      <label class="envio-drop" for="envio-archivos"><span>📷</span><b>Elegir imágenes</b><small>JPG, PNG o WEBP · Hasta 6 archivos · 8 MB cada uno</small></label>
      <input id="envio-archivos" type="file" accept="image/jpeg,image/png,image/webp" multiple hidden>
      <div id="envio-preview" class="envio-preview" aria-live="polite">Todavía no seleccionaste imágenes.</div>
      <label class="envio-label">¿De qué son? (opcional)
        <select id="envio-categoria"><option value="Variado">Un poco de todo</option><option>Apuntes</option><option>Biología</option><option>IPC</option><option>Memes</option><option>Mi gato / mascota</option><option>Otro</option></select>
      </label>
      <label class="envio-label">Tu apodo (opcional)<input id="envio-apodo" maxlength="20" placeholder="Podés enviarlo anónimamente"></label>
      <label class="envio-label">Mensaje (opcional)<textarea id="envio-mensaje" maxlength="300" rows="2" placeholder="Contame algo sobre las imágenes…"></textarea></label>
      <p class="envio-privacidad">🔒 Las imágenes quedan privadas y solo las puede ver el administrador. No se publican en Parcialito.</p>
      <button class="btn primario envio-enviar" id="envio-enviar" type="submit">Enviar imágenes</button><p id="envio-estado" role="status" class="envio-estado"></p>
    </form></section>`;
  document.body.append(modal);
  const close=()=>modal.remove();modal.querySelector('.envio-cerrar').onclick=close;modal.addEventListener('click',e=>{if(e.target===modal)close();});
  const input=modal.querySelector('#envio-archivos'),preview=modal.querySelector('#envio-preview'),form=modal.querySelector('form'),send=modal.querySelector('#envio-enviar'),status=modal.querySelector('#envio-estado');
  let files=[];
  input.addEventListener('change',()=>{files=[...input.files].slice(0,MAX_FILES);const invalid=files.find(f=>!['image/jpeg','image/png','image/webp'].includes(f.type)||f.size>MAX_BYTES);if(invalid){status.textContent='Cada archivo debe ser JPG, PNG o WEBP y pesar hasta 8 MB.';files=[];input.value='';}else status.textContent='';preview.innerHTML=files.length?files.map(f=>'<div class="envio-archivo">🖼️ <span>'+f.name.replace(/[&<>"]/g,'')+'</span><small>'+Math.ceil(f.size/1024)+' KB</small></div>').join(''):'Todavía no seleccionaste imágenes.';});
  form.addEventListener('submit',async e=>{e.preventDefault();if(!files.length){status.textContent='Primero elegí al menos una imagen.';return;}send.disabled=true;send.textContent='Enviando…';status.textContent='Subiendo tus imágenes de forma privada…';
    const batch=crypto.randomUUID();const uploaded=[];
    try{
      for(const file of files){const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';const path=batch+'/'+crypto.randomUUID()+'.'+ext;const r=await fetch(BASE+'/storage/v1/object/'+BUCKET+'/'+path,{method:'POST',headers:{apikey:KEY,'Content-Type':file.type,'x-upsert':'false'},body:file});if(!r.ok)throw new Error('No se pudo subir '+file.name+'. '+(await r.text()).slice(0,160));uploaded.push({path,nombre:file.name,tipo:file.type,tamano:file.size});}
      await request('/rest/v1/envios_imagenes',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({archivos:uploaded,categoria:modal.querySelector('#envio-categoria').value,apodo:safe(modal.querySelector('#envio-apodo').value).slice(0,20)||null,mensaje:modal.querySelector('#envio-mensaje').value.trim().slice(0,300)||null})});
      status.textContent='¡Listo! Tus imágenes llegaron al buzón privado. ¡Gracias por compartir!';form.reset();files=[];preview.textContent='Envío completado.';send.textContent='Enviado ✓';avisar('¡Imágenes enviadas!');setTimeout(close,2200);
    }catch(err){for(const f of uploaded)fetch(BASE+'/storage/v1/object/'+BUCKET+'/'+f.path,{method:'DELETE',headers:{apikey:KEY}}).catch(()=>{});status.textContent='No se pudo completar el envío. '+err.message;send.disabled=false;send.textContent='Reintentar envío';}
  });
}
