# AerisQ - Drought Detection Platform

**AI-powered drought detection using Sentinel-1 SAR satellite imagery**

![AerisQ](https://img.shields.io/badge/Version-3.1.0-green) ![Physics](https://img.shields.io/badge/Physics-v2.0-blue) ![License](https://img.shields.io/badge/License-MIT-yellow)

## 🌍 Overview

AerisQ uses radar backscatter analysis from Sentinel-1 SAR to detect drought conditions. Unlike optical imagery, SAR works through clouds and provides direct soil moisture information through the dielectric properties of the surface.

## 🔬 Physics Model

The drought detection is based on the relationship between soil moisture and radar backscatter:

```
σ₀ = f(mv, θ, ε, s)

Where:
- mv = volumetric soil moisture
- θ = incidence angle
- ε = dielectric constant (related to moisture)
- s = surface roughness
```

**Drought Thresholds (VV Polarization):**
| Condition | σ₀ (dB) | Drought % |
|-----------|---------|-----------|
| Normal | > -10 | < 10% |
| Mild | -10 to -12 | 10-30% |
| Moderate | -12 to -15 | 30-50% |
| Severe | -15 to -18 | 50-70% |
| Extreme | < -18 | > 70% |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/aerisq.git
cd aerisq
```

2. **Start the backend**
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
pip install -r requirements-standalone.txt
python standalone.py
```

3. **Start the frontend**
```bash
cd frontend
npm install
npm run dev
```

4. **Access the app**
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/docs
- Test credentials: `admin@aerisq.tech` / `password123`

## 📁 Project Structure

```
aerisq/
├── frontend/           # Next.js frontend
│   ├── app/           # App router pages
│   ├── components/    # React components
│   └── lib/           # API client, auth context
├── backend/           # FastAPI backend
│   ├── app/           # Application modules
│   │   └── agents/    # Physics engine
│   └── standalone.py  # Dev server
├── api/               # Vercel serverless API
│   └── index.py       # API endpoint
└── vercel.json        # Vercel configuration
```

## 🌐 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project to Vercel
3. Set environment variables:
   - `SECRET_KEY`: JWT secret
   - `GOD_MODE_EMAIL`: Admin email
   - `GOD_MODE_PASSWORD`: Admin password

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SECRET_KEY` | JWT signing key | Yes (production) |
| `CDSE_USERNAME` | Copernicus Data Space username | No (for real data) |
| `CDSE_PASSWORD` | Copernicus Data Space password | No (for real data) |

## 🧪 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/token` | POST | Get access token |
| `/api/v1/analyze/demo` | POST | Run demo analysis |
| `/api/v1/jobs/{id}/public` | GET | Get job results |
| `/api/v1/legend` | GET | Get severity legend |
| `/api/v1/baselines` | GET | Get seasonal baselines |

## 📊 Features

- ✅ Interactive map for polygon drawing
- ✅ Physics-based drought detection
- ✅ Seasonal adjustment model
- ✅ Historical baseline comparison
- ✅ Soil Moisture Index (0-100)
- ✅ Confidence scoring
- ✅ Real-time analysis results

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with ❤️ by the AerisQ Team
