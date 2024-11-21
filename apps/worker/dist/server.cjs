"use strict";var q=Object.create;var T=Object.defineProperty;var U=Object.getOwnPropertyDescriptor;var K=Object.getOwnPropertyNames;var F=Object.getPrototypeOf,M=Object.prototype.hasOwnProperty;var G=(e,t,o,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of K(t))!M.call(e,r)&&r!==o&&T(e,r,{get:()=>t[r],enumerable:!(n=U(t,r))||n.enumerable});return e};var j=(e,t,o)=>(o=e!=null?q(F(e)):{},G(t||!e||!e.__esModule?T(o,"default",{value:e,enumerable:!0}):o,e));const B=require("throng"),W=require("fs"),Q=require("path"),H=require("os"),J=require("crypto"),z=require("ioredis"),X=require("graphql-ws"),Z=require("ws"),m=require("fuels");var p={exports:{}};const ee="dotenv",te="16.4.5",oe="Loads environment variables from .env file",re="lib/main.js",ne="lib/main.d.ts",se={".":{types:"./lib/main.d.ts",require:"./lib/main.js",default:"./lib/main.js"},"./config":"./config.js","./config.js":"./config.js","./lib/env-options":"./lib/env-options.js","./lib/env-options.js":"./lib/env-options.js","./lib/cli-options":"./lib/cli-options.js","./lib/cli-options.js":"./lib/cli-options.js","./package.json":"./package.json"},ae={"dts-check":"tsc --project tests/types/tsconfig.json",lint:"standard","lint-readme":"standard-markdown",pretest:"npm run lint && npm run dts-check",test:"tap tests/*.js --100 -Rspec","test:coverage":"tap --coverage-report=lcov",prerelease:"npm test",release:"standard-version"},ce={type:"git",url:"git://github.com/motdotla/dotenv.git"},ie="https://dotenvx.com",le=["dotenv","env",".env","environment","variables","config","settings"],ue="README.md",pe="BSD-2-Clause",de={"@definitelytyped/dtslint":"^0.0.133","@types/node":"^18.11.3",decache:"^4.6.1",sinon:"^14.0.1",standard:"^17.0.0","standard-markdown":"^7.1.0","standard-version":"^9.5.0",tap:"^16.3.0",tar:"^6.1.11",typescript:"^4.8.4"},fe={node:">=12"},ve={fs:!1},ge={name:ee,version:te,description:oe,main:re,types:ne,exports:se,scripts:ae,repository:ce,funding:ie,keywords:le,readmeFilename:ue,license:pe,devDependencies:de,engines:fe,browser:ve},N=W,D=Q,_e=H,ye=J,Ee=ge,I=Ee.version,he=/(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;function me(e){const t={};let o=e.toString();o=o.replace(/\r\n?/mg,`
`);let n;for(;(n=he.exec(o))!=null;){const r=n[1];let s=n[2]||"";s=s.trim();const a=s[0];s=s.replace(/^(['"`])([\s\S]*)\1$/mg,"$2"),a==='"'&&(s=s.replace(/\\n/g,`
`),s=s.replace(/\\r/g,"\r")),t[r]=s}return t}function Ne(e){const t=k(e),o=i.configDotenv({path:t});if(!o.parsed){const a=new Error(`MISSING_DATA: Cannot parse ${t} for an unknown reason`);throw a.code="MISSING_DATA",a}const n=$(e).split(","),r=n.length;let s;for(let a=0;a<r;a++)try{const c=n[a].trim(),l=Ie(o,c);s=i.decrypt(l.ciphertext,l.key);break}catch(c){if(a+1>=r)throw c}return i.parse(s)}function we(e){console.log(`[dotenv@${I}][INFO] ${e}`)}function De(e){console.log(`[dotenv@${I}][WARN] ${e}`)}function g(e){console.log(`[dotenv@${I}][DEBUG] ${e}`)}function $(e){return e&&e.DOTENV_KEY&&e.DOTENV_KEY.length>0?e.DOTENV_KEY:process.env.DOTENV_KEY&&process.env.DOTENV_KEY.length>0?process.env.DOTENV_KEY:""}function Ie(e,t){let o;try{o=new URL(t)}catch(c){if(c.code==="ERR_INVALID_URL"){const l=new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");throw l.code="INVALID_DOTENV_KEY",l}throw c}const n=o.password;if(!n){const c=new Error("INVALID_DOTENV_KEY: Missing key part");throw c.code="INVALID_DOTENV_KEY",c}const r=o.searchParams.get("environment");if(!r){const c=new Error("INVALID_DOTENV_KEY: Missing environment part");throw c.code="INVALID_DOTENV_KEY",c}const s=`DOTENV_VAULT_${r.toUpperCase()}`,a=e.parsed[s];if(!a){const c=new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${s} in your .env.vault file.`);throw c.code="NOT_FOUND_DOTENV_ENVIRONMENT",c}return{ciphertext:a,key:n}}function k(e){let t=null;if(e&&e.path&&e.path.length>0)if(Array.isArray(e.path))for(const o of e.path)N.existsSync(o)&&(t=o.endsWith(".vault")?o:`${o}.vault`);else t=e.path.endsWith(".vault")?e.path:`${e.path}.vault`;else t=D.resolve(process.cwd(),".env.vault");return N.existsSync(t)?t:null}function V(e){return e[0]==="~"?D.join(_e.homedir(),e.slice(1)):e}function Oe(e){we("Loading env from encrypted .env.vault");const t=i._parseVault(e);let o=process.env;return e&&e.processEnv!=null&&(o=e.processEnv),i.populate(o,t,e),{parsed:t}}function be(e){const t=D.resolve(process.cwd(),".env");let o="utf8";const n=!!(e&&e.debug);e&&e.encoding?o=e.encoding:n&&g("No encoding is specified. UTF-8 is used by default");let r=[t];if(e&&e.path)if(!Array.isArray(e.path))r=[V(e.path)];else{r=[];for(const l of e.path)r.push(V(l))}let s;const a={};for(const l of r)try{const u=i.parse(N.readFileSync(l,{encoding:o}));i.populate(a,u,e)}catch(u){n&&g(`Failed to load ${l} ${u.message}`),s=u}let c=process.env;return e&&e.processEnv!=null&&(c=e.processEnv),i.populate(c,a,e),s?{parsed:a,error:s}:{parsed:a}}function Te(e){if($(e).length===0)return i.configDotenv(e);const t=k(e);return t?i._configVault(e):(De(`You set DOTENV_KEY but you are missing a .env.vault file at ${t}. Did you forget to build it?`),i.configDotenv(e))}function Ve(e,t){const o=Buffer.from(t.slice(-64),"hex");let n=Buffer.from(e,"base64");const r=n.subarray(0,12),s=n.subarray(-16);n=n.subarray(12,-16);try{const a=ye.createDecipheriv("aes-256-gcm",o,r);return a.setAuthTag(s),`${a.update(n)}${a.final()}`}catch(a){const c=a instanceof RangeError,l=a.message==="Invalid key length",u=a.message==="Unsupported state or unable to authenticate data";if(c||l){const d=new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");throw d.code="INVALID_DOTENV_KEY",d}else if(u){const d=new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");throw d.code="DECRYPTION_FAILED",d}else throw a}}function Ae(e,t,o={}){const n=!!(o&&o.debug),r=!!(o&&o.override);if(typeof t!="object"){const s=new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");throw s.code="OBJECT_REQUIRED",s}for(const s of Object.keys(t))Object.prototype.hasOwnProperty.call(e,s)?(r===!0&&(e[s]=t[s]),n&&g(r===!0?`"${s}" is already defined and WAS overwritten`:`"${s}" is already defined and was NOT overwritten`)):e[s]=t[s]}const i={configDotenv:be,_configVault:Oe,_parseVault:Ne,config:Te,decrypt:Ve,parse:me,populate:Ae};p.exports.configDotenv=i.configDotenv;p.exports._configVault=i._configVault;p.exports._parseVault=i._parseVault;p.exports.config=i.config;p.exports.decrypt=i.decrypt;p.exports.parse=i.parse;p.exports.populate=i.populate;p.exports=i;var $e=p.exports;const f={};process.env.DOTENV_CONFIG_ENCODING!=null&&(f.encoding=process.env.DOTENV_CONFIG_ENCODING);process.env.DOTENV_CONFIG_PATH!=null&&(f.path=process.env.DOTENV_CONFIG_PATH);process.env.DOTENV_CONFIG_DEBUG!=null&&(f.debug=process.env.DOTENV_CONFIG_DEBUG);process.env.DOTENV_CONFIG_OVERRIDE!=null&&(f.override=process.env.DOTENV_CONFIG_OVERRIDE);process.env.DOTENV_CONFIG_DOTENV_KEY!=null&&(f.DOTENV_KEY=process.env.DOTENV_CONFIG_DOTENV_KEY);var ke=f;const Ce=/^dotenv_config_(encoding|path|debug|override|DOTENV_KEY)=(.+)$/;var Pe=function(t){return t.reduce(function(o,n){const r=n.match(Ce);return r&&(o[r[1]]=r[2]),o},{})};(function(){$e.config(Object.assign({},ke,Pe(process.argv)))})();const O={redis:{url:process.env.REDISCLOUD_URL||"redis://localhost:6379",prefix:"duckscreener:",ttl:5*60},graphql:{url:process.env.GRAPHQL_URL||"https://beta-4.fuel.network/graphql",wsUrl:process.env.GRAPHQL_URL?.replace("https","wss")||"wss://beta-4.fuel.network/graphql"},sync:{interval:parseInt(process.env.SYNC_INTERVAL||"300000"),batchSize:parseInt(process.env.SYNC_BATCH_SIZE||"50")}};class v{constructor(){v.instance||(v.instance=new z(process.env.REDISCLOUD_URL))}getInstance(){return v.instance}}const w=async(e,t,o)=>{try{await b.set(e,t,"EX",o)}catch(n){console.error("Error setting value:",n)}},Se=async e=>{try{return await b.get(e)}catch(t){return console.error("Error getting value:",t),null}},b=new v().getInstance();let y=null;async function Le(){if(!y){const{GraphQLClient:e}=await import("graphql-request");y=new e(O.graphql.url,{})}return y}const Re=X.createClient({url:O.graphql.wsUrl,webSocketImpl:Z,connectionParams:{}});function xe(e,t){(async()=>{const o=n=>{t(n.data)};await new Promise((n,r)=>{Re.subscribe({query:e},{next:o,error:r,complete:()=>n(void 0)})})})()}async function Ye(e,t){const o=await Le();try{return await o.request(e,t)}catch(n){console.log(n)}}let E;async function C(){return E||(E=await m.Provider.create(process.env.PUBLIC_FUEL_RPC_URL)),E}let h;async function P(){if(!h){const e=await Promise.resolve().then(()=>require("./index-CWU-M3T7.cjs")),t=await C();h=new e.ReadonlyMiraAmm(t)}return h}async function qe(e){return await(await P()).lpAssetInfo(e)}async function Ue(e){const t=e.split("_"),o=await P(),n=[{bits:t[0]},{bits:t[1]},t[2]==="true"],r=await o.poolMetadata(n);return{...r,reserve0:Number(r?.reserve0),reserve1:Number(r?.reserve1)}}const Ke="pool:",S="pool_ids",A=60*60*24*365*10;function Fe(e){return`${Ke}${e}`}async function L(e){try{const[t,o,n]=e.pool_id.split("_"),r=await Ue(`${t}_${o}_${n==="true"}`);if(console.log("metadata",r),!r){console.error(`Failed to get metadata for pool ${e.pool_id}`);return}const s=r.poolId?.[0].bits,a=r.poolId?.[1].bits,c={bits:r.liquidity?.[0].bits};if(!s||!a){console.error(`Invalid token addresses for pool ${e.pool_id}`);return}const l=await qe(c),u=l?.name,d=u?.split("-"),R=d?.[0],x=d?.[1].split(" ")[0],Xe=await C();console.log("token0::",s);const Y={id:e.pool_id,lpName:u,token0Name:R,token1Name:x,token0Address:s,token1Address:a,isStable:n==="true",decimals0:r.decimals0||0,decimals1:r.decimals1||0,reserve0:r.reserve0.toString(),reserve1:r.reserve1.toString(),lastUpdated:Date.now(),createdAt:new Date(e.time).getTime(),blockHeight:e.block_height,totalSupplyBNStr:l?.totalSupply?.toString()||""};await w(Fe(e.pool_id),JSON.stringify(Y),A);const _=await Me();_.includes(e.pool_id)||(_.push(e.pool_id),await w(S,JSON.stringify(_),A)),console.log(`Updated pool catalog for ${e.pool_id}`)}catch(t){throw console.error(`Error updating pool catalog for ${e.pool_id}:`,t),t}}async function Me(){const e=await Se(S);return e?JSON.parse(e):[]}async function Ge(){const e=`
        query GetAllPools {
            MiraV1Core_CreatePoolEvent(distinct_on: pool_id) {
                pool_id
                block_height
                time
            }
        }
    `;try{const o=(await Ye(e,{}))?.data?.MiraV1Core_CreatePoolEvent||[];console.log(`Syncing ${o.length} existing pools...`);for(const n of o)await L(n);console.log("Pool sync completed")}catch(t){throw console.error("Error syncing pools:",t),t}}class je{constructor(){this.syncInterval=null}async start(){console.log("Starting pool sync service..."),await this.syncPools(),this.syncInterval=setInterval(()=>this.syncPools(),O.sync.interval)}async stop(){this.syncInterval&&(clearInterval(this.syncInterval),this.syncInterval=null)}async syncPools(){try{console.log("Starting pool sync...");const t=Date.now();await Ge(),console.log(`Pool sync completed in ${Date.now()-t}ms`)}catch(t){console.error("Error during pool sync:",t)}}}const Be=`
    subscription OnCreatePool {
        MiraV1Core_CreatePoolEvent {
            pool_id
            block_height
            time
        }
    }
`;async function We(){console.log("Starting pool subscriber...");try{xe(Be,async e=>{const t=e.MiraV1Core_CreatePoolEvent;console.log("MiraV1Core_CreatePoolEvent",t);for(const o of t)console.log("New pool created:",o.pool_id),await L(o)}),console.log("Pool subscriber started successfully")}catch(e){throw console.error("Failed to start pool subscriber:",e),e}}const Qe=60*60*24*365*10;async function He(){console.log(m.assets),await w("fuel_assets",JSON.stringify(m.assets),Qe)}const Je=async e=>{try{console.log(`Worker ${e} starting...`),await He();const t=new je;await t.start(),await We(),console.log(`Worker ${e} started successfully`),process.on("SIGTERM",async()=>{console.log(`Worker ${e} received SIGTERM, shutting down...`),await t.stop(),await b.cleanup(),process.exit(0)})}catch(t){console.error(`Worker ${e} failed to start:`,t),process.exit(1)}},ze=parseInt(process.env.WEB_CONCURRENCY||"1",10);B({workers:ze,start:Je});
