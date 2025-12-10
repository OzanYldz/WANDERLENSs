# Vercel Backend Kurulum Rehberi

## 🚀 Hızlı Başlangıç

### 1. Vercel Hesabı Oluşturma

1. https://vercel.com adresine gidin
2. "Sign Up" ile GitHub hesabınızla giriş yapın

### 2. Projeyi Vercel'e Deploy Etme

#### Yöntem 1: GitHub ile (Önerilen)

1. `vercel` klasörünü GitHub repository'nize push edin
2. Vercel Dashboard'a gidin
3. "Add New Project" butonuna tıklayın
4. GitHub repository'nizi seçin
5. Root Directory olarak `vercel` klasörünü seçin
6. "Deploy" butonuna tıklayın

#### Yöntem 2: Vercel CLI ile

```bash
cd vercel
npm install
vercel login
vercel
```

### 3. Environment Variable Ekleme

**ÖNEMLİ**: Deploy sonrası mutlaka environment variable ekleyin!

1. Vercel Dashboard'da projenizi açın
2. **Settings** > **Environment Variables** sekmesine gidin
3. Yeni variable ekleyin:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: `AIzaSyCLa5lfqAnUGuKPGWR8YxkM6bqVQ1-pg1M`
   - **Environment**: Production, Preview, Development (hepsini seçin)
4. **Save** butonuna tıklayın
5. **Redeploy** yapın (Deployments > ... > Redeploy)

### 4. Vercel URL'ini Alma

1. Deploy sonrası Vercel size bir URL verecek
2. Örnek: `https://wanderlens-api.vercel.app`
3. Bu URL'i kopyalayın

### 5. iOS Uygulamasını Güncelleme

1. `GeminiService.swift` dosyasını açın
2. `vercelBaseURL` değişkenini bulun:
   ```swift
   private let vercelBaseURL = "https://YOUR_VERCEL_URL.vercel.app"
   ```
3. `YOUR_VERCEL_URL` kısmını kendi Vercel URL'inizle değiştirin:
   ```swift
   private let vercelBaseURL = "https://wanderlens-api.vercel.app"
   ```
4. Xcode'da build edin ve test edin

## 📝 API Endpoints

### POST `/api/gemini`

Ana analiz endpoint'i. Hem full analysis hem de quick detection için kullanılır.

**Request:**
```json
{
  "imageData": "base64_encoded_image",
  "location": {
    "latitude": 48.8566,
    "longitude": 2.3522
  },
  "modeDescription": "Historian mode...",
  "language": "en",
  "requestType": "full" // veya "quickDetect"
}
```

**Response:**
```json
{
  "text": "Response from Gemini",
  "success": true
}
```

### POST `/api/getSecret`

Sır özelliği endpoint'i.

**Request:**
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

## ✅ Test Etme

### 1. Vercel Dashboard'dan Test

1. Deploy sonrası Functions sekmesine gidin
2. `/api/gemini` endpoint'ini test edin
3. Logs sekmesinden hataları kontrol edin

### 2. iOS Uygulamasından Test

1. Vercel URL'ini `GeminiService.swift`'e ekleyin
2. Uygulamayı çalıştırın
3. Bir fotoğraf çekin
4. Analiz sonucunu kontrol edin

## 🔒 Güvenlik

- ✅ API key artık environment variable'da
- ✅ iOS uygulamasından direkt API key gönderilmiyor
- ✅ CORS headers eklendi
- ⚠️ Production'da CORS'u sadece kendi domain'inizle sınırlandırabilirsiniz

## 🐛 Sorun Giderme

### Environment Variable Çalışmıyor

1. Environment variable'ın doğru eklendiğinden emin olun
2. Redeploy yapın
3. Logs sekmesinden kontrol edin

### API Çağrıları Başarısız

1. Vercel URL'inin doğru olduğundan emin olun
2. Network tab'ından request/response'ları kontrol edin
3. Vercel Logs'tan hataları kontrol edin

### CORS Hatası

1. `gemini.ts` ve `getSecret.ts` dosyalarında CORS headers kontrol edin
2. Gerekirse domain kısıtlaması ekleyin

## 📚 Daha Fazla Bilgi

- Vercel Docs: https://vercel.com/docs
- Vercel Functions: https://vercel.com/docs/functions


