require('dotenv').config();

const RUIJIE_CLOUD_URL = process.env.RUIJIE_CLOUD_URL || "https://cloud-la.ruijienetworks.com";
const RUIJIE_APP_ID = process.env.RUIJIE_APP_ID;
const RUIJIE_SECRET = process.env.RUIJIE_SECRET;
const RUIJIE_GROUP_ID = process.env.RUIJIE_GROUP_ID;

async function test() {
  try {
    const tokenUrl = `${RUIJIE_CLOUD_URL}/service/api/oauth20/client/access_token?token=d63dss0a81e4415a889ac5b78fsc904a`;
    const tokenRes = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appid: RUIJIE_APP_ID,
        secret: RUIJIE_SECRET
      })
    });
    const tokenData = await tokenRes.json();
    const token = tokenData.accessToken || tokenData.access_token || (tokenData.data && tokenData.data.accessToken);
    console.log("Token:", token);

    // Fetch devices
    const devicesUrl = `${RUIJIE_CLOUD_URL}/service/api/maint/devices?group_id=${RUIJIE_GROUP_ID}&common_type=AP&page=0&per_page=100&access_token=${token}`;
    console.log("Fetching devices from:", devicesUrl);
    const devicesRes = await fetch(devicesUrl);
    const devicesData = await devicesRes.json();
    console.log("Devices Response:", JSON.stringify(devicesData, null, 2));

  } catch (err) {
    console.error("Error:", err);
  }
}

test();
