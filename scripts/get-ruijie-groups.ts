import dotenv from "dotenv";

dotenv.config();

const RUIJIE_CLOUD_URL = process.env.RUIJIE_CLOUD_URL || "https://cloud-la.ruijienetworks.com";
const RUIJIE_APP_ID = process.env.RUIJIE_APP_ID;
const RUIJIE_SECRET = process.env.RUIJIE_SECRET;

async function main() {
  if (!RUIJIE_APP_ID || !RUIJIE_SECRET) {
    console.error("❌ Faltan RUIJIE_APP_ID o RUIJIE_SECRET en el .env");
    process.exit(1);
  }

  console.log("Obteniendo token...");
  const tokenRes = await fetch(`${RUIJIE_CLOUD_URL}/service/api/oauth20/client/access_token?token=d63dss0a81e4415a889ac5b78fsc904a`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      appid: RUIJIE_APP_ID,
      secret: RUIJIE_SECRET
    })
  });

  const tokenData = await tokenRes.json();
  console.log("Respuesta de Ruijie API:", tokenData);

  if (!tokenRes.ok || tokenData.code !== 0) {
    console.error("❌ Error obteniendo token:", tokenData);
    process.exit(1);
  }

  const token = tokenData.accessToken || tokenData.access_token;
  if (!token) {
    console.error("❌ No se recibió un access token:", tokenData);
    process.exit(1);
  }
  console.log("✅ Token obtenido:", token.substring(0, 10) + "...");

  console.log("Obteniendo lista de grupos (Group IDs)...");
  const groupsRes = await fetch(`${RUIJIE_CLOUD_URL}/service/api/group/single/tree?depth=BUILDING&access_token=${token}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });

  const groupsData = await groupsRes.json();
  console.log("Respuesta Grupos:", groupsData);
  
  if (groupsData.code !== 0) {
    console.error("❌ API devolvió error al obtener grupos:", groupsData.msg);
    process.exit(1);
  }

  console.log("\n📋 GRUPOS ENCONTRADOS:");
  console.log("========================================");
  if (groupsData.groups) {
    console.log(`Nombre Nivel Superior: ${groupsData.groups.name}`);
    console.log(`Group ID Superior:     ${groupsData.groups.groupId}`);
    console.log("========================================\n");
    
    if (groupsData.groups.subGroups && groupsData.groups.subGroups.length > 0) {
      console.log("Sub-Grupos (Proyectos/Edificios):");
      groupsData.groups.subGroups.forEach((sg: any) => {
        console.log(`- Nombre: ${sg.name}`);
        console.log(`  Group ID: ${sg.groupId}`);
        console.log(`  Tipo: ${sg.type}`);
        console.log("  ------------------------");
      });
    } else {
      console.log("No se encontraron sub-grupos.");
    }
  } else {
    console.log("No se devolvió un campo 'groups'. Verifica la respuesta arriba.");
  }
}

main().catch(console.error);
