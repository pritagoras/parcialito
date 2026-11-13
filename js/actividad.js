import { estado } from './store.js?v=20261112-1';
import { idDispositivo } from './dispositivo.js?v=20261113-admin1';
const URL='https://tnpcvmnwuhsxdxvwxvlh.supabase.co/rest/v1/';
const KEY='sb_publishable_UXVhm9cko_YZm3GrAUBRyg_YSIfM03O';
let sessionId=null, deviceId=null, started=false, heartbeat=null, lastView='';
const getApodo=()=>String(estado.apodo||'').slice(0,20)||null;
function post(path,body,keepalive=false){return fetch(URL+path,{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify(body),keepalive}).then(r=>{if(!r.ok)throw Error('activity '+r.status);return r;});}
export function idSesionActividad(){return sessionId;}
export function registrarEventoActividad(evento,datos={}){if(!sessionId||!deviceId)return Promise.resolve();const fila={actividad_session_id:sessionId,dispositivo_id:deviceId,evento,apodo:getApodo(),materia:datos.materia||null,tema:datos.tema||null,modo:datos.modo||null,pregunta_id:datos.pregunta_id||null,pregunta:datos.pregunta||null,seleccion:datos.seleccion||null,respuesta_correcta:datos.respuesta_correcta||null,acierto:typeof datos.acierto==='boolean'?datos.acierto:null,numero_pregunta:datos.numero_pregunta||null,total_preguntas:datos.total_preguntas||null,datos:datos.datos||{}};return post('actividad_eventos',fila,true).catch(e=>console.warn('[Actividad]',e));}
export async function iniciarActividad(){if(started)return;started=true;deviceId=idDispositivo();if(!deviceId)return;try{sessionId=sessionStorage.getItem('parcialito_actividad_sesion');if(!sessionId){sessionId=crypto.randomUUID();sessionStorage.setItem('parcialito_actividad_sesion',sessionId);await post('actividad_sesiones',{id:sessionId,dispositivo_id:deviceId,apodo:getApodo()});}await registrarEventoActividad('app_open');}catch(e){console.warn('[Actividad] No se pudo iniciar sesión',e);sessionId=null;return;}
const heartbeatFn=()=>{if(document.visibilityState==='visible')registrarEventoActividad('heartbeat');};heartbeat=setInterval(heartbeatFn,30000);
const root=document.getElementById('app');if(root&&'MutationObserver'in window){let pending=false;const obs=new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;const h=root.querySelector('h1')?.textContent?.trim().replace(/\s+/g,' ').slice(0,100);if(h&&h!==lastView){lastView=h;registrarEventoActividad('vista',{tema:h});}})});obs.observe(root,{childList:true,subtree:true,characterData:true});}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')heartbeatFn();});
window.addEventListener('pagehide',()=>{if(heartbeat)clearInterval(heartbeat);registrarEventoActividad('salida');},{once:true});
}
