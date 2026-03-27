let cityHistory = [];
const sirenUrl = 'https://cdn.pixabay.com/audio/2022/03/10/audio_03d9354e60.mp3';
const buzzer = new Audio(sirenUrl);

// 1. LIVE CLOCK FUNCTION
function updateClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = now.toLocaleDateString();
    document.getElementById('liveClock').innerText = `${timeStr} | ${dateStr}`;
}
setInterval(updateClock, 1000);

function unlockAudio() {
    buzzer.play().then(() => { buzzer.pause(); buzzer.currentTime = 0; }).catch(() => {});
}

// 2. FAMOUS PLACES & WEATHER BACKGROUND
function changeBg(city, weatherMain) {
    const body = document.body;
    let bgUrl = "";
    const cityName = city.toLowerCase();

    if (cityName.includes("paris")) bgUrl = "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1400";
    else if (cityName.includes("agra")) bgUrl = "https://images.unsplash.com/photo-1564507592334-1e40bb4a84d7?q=80&w=1400";
    else if (cityName.includes("dubai")) bgUrl = "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1400";
    else if (cityName.includes("delhi")) bgUrl = "https://images.unsplash.com/photo-1587474260584-1f35a491179a?q=80&w=1400";
    else if (cityName.includes("mecca")) bgUrl = "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=1400";
    else {
        const w = weatherMain.toLowerCase();
        if(w.includes('cloud')) bgUrl = "https://images.unsplash.com/photo-1483977399921-6cf381cbb615?q=80&w=1400";
        else if(w.includes('rain')) bgUrl = "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?q=80&w=1400";
        else if(w.includes('snow')) bgUrl = "https://images.unsplash.com/photo-1478265409131-1f65c88f965c?q=80&w=1400";
        else bgUrl = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1400";
    }
    body.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${bgUrl}')`;
}

async function getWeather(cityFromHistory = null) {
    const input = document.getElementById('cityInput');
    const city = cityFromHistory || input.value.trim();
    if (!city) return;

    const apiKey = 'f00c38e0279b7bc85480c3fe775d518c';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.cod === 200) {
            updateDashboard(data);
            input.value = "";
        } else { alert("City not found!"); }
    } catch (e) { alert("Check Internet!"); }
}

function updateDashboard(data) {
    document.getElementById('displayCity').innerText = data.name.toUpperCase();
    document.getElementById('displayTemp').innerText = Math.round(data.main.temp) + "°C";
    document.getElementById('humidityDisplay').innerText = data.main.humidity + "%";
    document.getElementById('windDisplay').innerText = data.wind.speed + " km/h";
    document.getElementById('weatherDesc').innerText = "Forecast: " + data.weather[0].description;
    
    // 3. WEATHER ICON UPDATE
    const iconCode = data.weather[0].icon;
    document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    const temp = data.main.temp;
    const wind = data.wind.speed;
    const tips = document.getElementById('safetyTips');

    // 4. DYNAMIC SAFETY TIPS
    if (temp <= 0 || wind > 25) {
        setRiskUI("HIGH RISK", "#ff2e63", "40 KM/H", "EXTREME HIGH");
        tips.innerText = "⚠️ ADVISORY: TIRE CHAINS REQUIRED & LOW VISIBILITY GEAR";
        buzzer.loop = true; buzzer.play();
    } else if (temp < 15) {
        setRiskUI("MEDIUM RISK", "#ff9800", "60 KM/H", "MODERATE");
        tips.innerText = "📢 NOTICE: CHECK HEATING SYSTEMS & FOG LIGHTS";
        buzzer.pause();
    } else {
        setRiskUI("LOW RISK", "#00d272", "85 KM/H", "NORMAL");
        tips.innerText = "✅ STATUS: ALL CLEAR - OPTIMAL DRIVING CONDITIONS";
        buzzer.pause();
    }

    changeBg(data.name, data.weather[0].main);

    if (!cityHistory.includes(data.name)) {
        cityHistory.unshift(data.name);
        if (cityHistory.length > 8) cityHistory.pop();
        renderHistory();
    }
}

function setRiskUI(risk, color, speed, fuel) {
    const indicator = document.getElementById('statusIndicator');
    document.getElementById('riskLevel').innerText = risk;
    document.getElementById('riskLevel').style.color = color;
    indicator.style.background = color;
    indicator.style.boxShadow = `0 0 40px ${color}`;
    document.getElementById('safeSpeed').innerText = speed;
    document.getElementById('fuelAdvice').innerText = fuel;
}

function renderHistory() {
    document.getElementById('historyList').innerHTML = cityHistory.map(c => 
        `<button class="history-btn" onclick="getWeather('${c}')">${c}</button>`).join("");
}

function startVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Use Chrome!");
    const rec = new SpeechRecognition();
    rec.onresult = (e) => {
        document.getElementById('cityInput').value = e.results[0][0].transcript;
        getWeather();
    };
    rec.start();
}