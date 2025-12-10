# WanderLens API - Vercel Backend

Bu backend, Gemini API key'ini güvenli bir şekilde saklamak ve iOS uygulamasından API çağrıları yapmak için kullanılır.

## 🚀 Kurulum

### 1. Vercel'e Deploy Etme

1. Vercel hesabı oluşturun: https://vercel.com
2. GitHub repository'nizi Vercel'e bağlayın veya `vercel` CLI ile deploy edin:

```bash
cd vercel
npm install
vercel
```

### 2. Environment Variable Ekleme

Vercel Dashboard'da:
1. Projenizi seçin
2. Settings > Environment Variables'a gidin
3. Yeni variable ekleyin:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: `AIzaSyCLa5lfqAnUGuKPGWR8YxkM6bqVQ1-pg1M`
   - **Environment**: Production, Preview, Development (hepsini seçin)

### 3. API Endpoints

Deploy sonrası şu endpoint'ler kullanılabilir:

- **POST** `/api/gemini` - Ana analiz endpoint'i
- **POST** `/api/getSecret` - Sır özelliği endpoint'i

### 4. iOS Uygulamasını Güncelleme

`GeminiService.swift` dosyasını güncelleyin (aşağıdaki dosyaya bakın).

## 📝 API Kullanımı

### `/api/gemini` Endpoint

**Request Body:**
```json
{
  "imageData": "base64_encoded_image",
  "location": {
    "latitude": 48.8566,
    "longitude": 2.3522
  },
  "modeDescription": "Historian mode description...",
  "language": "en",
  "requestType": "full" // veya "quickDetect"
}
```

**Response:**
```json
{
  "text": "Response text from Gemini",
  "success": true
}
```

### `/api/getSecret` Endpoint

**Request Body:**
```json
{
  "landmarkName": "Eiffel Tower",
  "language": "en"
}
```

**Response:**
```json
{
  "secret": "Secret text from Gemini",
  "success": true
}
```

## 🔒 Güvenlik

- API key artık environment variable'da saklanıyor
- iOS uygulamasından direkt API key gönderilmiyor
- CORS headers eklendi
- Error handling mevcut

## 📦 Dosya Yapısı

```
vercel/
├── api/
│   ├── gemini.ts      # Ana analiz endpoint
│   └── getSecret.ts   # Sır özelliği endpoint
├── package.json
├── tsconfig.json
└── README.md
```

## ⚠️ Önemli Notlar

1. **API Key**: Vercel Dashboard'da `GEMINI_API_KEY` environment variable'ını eklemeyi unutmayın
2. **CORS**: Tüm origin'lerden erişime izin veriliyor (`*`). Production'da domain kısıtlaması ekleyebilirsiniz
3. **Rate Limiting**: Gerekirse Vercel'in rate limiting özelliklerini kullanabilirsiniz


