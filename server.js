const path = require('path');
const express = require('express');
const axios = require('axios');
const msal = require('@azure/msal-node');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

const tenantId = process.env.POWERBI_TENANT_ID;
const clientId = process.env.POWERBI_CLIENT_ID;
const clientSecret = process.env.POWERBI_CLIENT_SECRET;

const defaultWorkspaceId = process.env.POWERBI_WORKSPACE_ID;
const defaultReportId = process.env.POWERBI_REPORT_ID;

if (!tenantId || !clientId || !clientSecret) {
  // eslint-disable-next-line no-console
  console.error('❌ Debes definir POWERBI_TENANT_ID, POWERBI_CLIENT_ID y POWERBI_CLIENT_SECRET en el archivo .env');
  process.exit(1);
}

const msalClient = new msal.ConfidentialClientApplication({
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    clientSecret,
  },
});

app.use(express.json());
app.use(express.static(path.join(__dirname)));

async function acquireAccessToken() {
  const tokenRequest = {
    scopes: ['https://analysis.windows.net/powerbi/api/.default'],
  };

  const response = await msalClient.acquireTokenByClientCredential(tokenRequest);
  return response?.accessToken;
}

async function fetchReportMetadata(accessToken, workspaceId, reportId) {
  const url = `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}`;
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return {
    id: data.id,
    name: data.name,
    datasetId: data.datasetId,
    embedUrl: data.embedUrl,
  };
}

async function generateEmbedToken(accessToken, workspaceId, reportId, datasetId) {
  const url = `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}/GenerateToken`;

  const payload = {
    accessLevel: 'View',
    datasets: [{ id: datasetId }],
  };

  const { data } = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  return {
    token: data.token,
    expiration: data.expiration,
  };
}

app.post('/api/embed-token', async (req, res) => {
  try {
    const workspaceId = req.body.workspaceId || defaultWorkspaceId;
    const reportId = req.body.reportId || defaultReportId;

    if (!workspaceId || !reportId) {
      return res.status(400).json({
        message: 'workspaceId y reportId son obligatorios.',
      });
    }

    const accessToken = await acquireAccessToken();

    if (!accessToken) {
      return res.status(401).json({ message: 'No fue posible obtener un token de acceso.' });
    }

    const report = await fetchReportMetadata(accessToken, workspaceId, reportId);
    const embedToken = await generateEmbedToken(accessToken, workspaceId, reportId, report.datasetId);

    return res.json({
      reportId: report.id,
      name: report.name,
      datasetId: report.datasetId,
      embedUrl: report.embedUrl,
      embedToken: embedToken.token,
      expiration: embedToken.expiration,
    });
  } catch (error) {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      return res.status(401).json({ message: 'Sin autorización para generar el Embed Token.' });
    }

    // eslint-disable-next-line no-console
    console.error('Error generando el Embed Token:', error.response?.data || error.message);
    return res.status(500).json({ message: 'Error inesperado obteniendo el Embed Token.' });
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
