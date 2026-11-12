import { it, expect, vi } from 'vitest';
import { startAppUpdates } from '../src/services/appUpdates';
const setup = ({dirty=false,form=false,path='/',newVersion='new',online=true}={}) => {
 const win=new EventTarget();win.location={pathname:path,reload:vi.fn()};win.setInterval=vi.fn(()=>1);win.clearInterval=vi.fn();
 const doc=new EventTarget();doc.visibilityState='visible';doc.querySelector=()=>form?{}:null;
 const nav={onLine:online,serviceWorker:new EventTarget()};nav.serviceWorker.getRegistration=async()=>({update:vi.fn()});
 const fetcher=vi.fn(async()=>({ok:true,json:async()=>({version:newVersion})}));
 const stop=startAppUpdates({win,doc,nav,fetcher,version:'old'});
 if(dirty){const event=new Event('input');Object.defineProperty(event,'target',{value:{closest:()=>({})}});doc.dispatchEvent(event);}
 return {win,doc,nav,fetcher,stop};
};
it('refreshes an idle app once when the build changes',async()=>{const x=setup();await vi.waitFor(()=>expect(x.win.location.reload).toHaveBeenCalledTimes(1));x.win.dispatchEvent(new Event('focus'));await Promise.resolve();expect(x.win.location.reload).toHaveBeenCalledTimes(1);x.stop();});
it('offers an update without discarding a draft',async()=>{const x=setup({form:true});const offer=vi.fn();x.win.addEventListener('peptidelog-update-available',offer);await vi.waitFor(()=>expect(offer).toHaveBeenCalled());expect(x.win.location.reload).not.toHaveBeenCalled();x.stop();});
it('protects OAuth callbacks, offline use, and unchanged builds',async()=>{for(const opts of [{path:'/callback'},{online:false},{newVersion:'old'}]){const x=setup(opts);await Promise.resolve();await Promise.resolve();expect(x.win.location.reload).not.toHaveBeenCalled();x.stop();}});
it('does not refresh after typing in a form',async()=>{const x=setup({dirty:true});await Promise.resolve();await Promise.resolve();expect(x.win.location.reload).not.toHaveBeenCalled();x.stop();});
