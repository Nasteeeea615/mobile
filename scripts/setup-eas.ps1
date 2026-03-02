#!/usr/bin/env pwsh
# EAS Build Setup Script для Windows
# Этот скрипт помогает настроить EAS Build для iOS и Android

Write-Host "🚀 EAS Build Setup Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Проверка установки EAS CLI
Write-Host "📦 Проверка EAS CLI..." -ForegroundColor Yellow
$easInstalled = Get-Command eas -ErrorAction SilentlyContinue

if (-not $easInstalled) {
    Write-Host "❌ EAS CLI не установлен" -ForegroundColor Red
    Write-Host "📥 Устанавливаем EAS CLI..." -ForegroundColor Yellow
    npm install -g eas-cli
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Ошибка установки EAS CLI" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ EAS CLI установлен" -ForegroundColor Green
} else {
    Write-Host "✅ EAS CLI уже установлен" -ForegroundColor Green
}

Write-Host ""

# Проверка авторизации
Write-Host "🔐 Проверка авторизации в Expo..." -ForegroundColor Yellow
$whoami = eas whoami 2>&1

if ($whoami -match "Not logged in") {
    Write-Host "❌ Вы не авторизованы в Expo" -ForegroundColor Red
    Write-Host "📝 Запускаем процесс авторизации..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Выберите способ авторизации:" -ForegroundColor Cyan
    Write-Host "1. Авторизация через браузер (рекомендуется)" -ForegroundColor White
    Write-Host "2. Авторизация через username/password" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "Ваш выбор (1 или 2)"
    
    if ($choice -eq "1") {
        eas login
    } else {
        $username = Read-Host "Введите ваш Expo username"
        $password = Read-Host "Введите ваш пароль" -AsSecureString
        $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))
        
        Write-Output "$username`n$plainPassword" | eas login
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Ошибка авторизации" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Авторизация успешна" -ForegroundColor Green
} else {
    Write-Host "✅ Вы уже авторизованы как: $whoami" -ForegroundColor Green
}

Write-Host ""

# Проверка/создание проекта EAS
Write-Host "🏗️  Настройка EAS проекта..." -ForegroundColor Yellow

$appJsonPath = Join-Path $PSScriptRoot ".." "app.json"
$appJson = Get-Content $appJsonPath -Raw | ConvertFrom-Json

$hasProjectId = $appJson.expo.extra.eas.projectId -and $appJson.expo.extra.eas.projectId -ne "your-project-id-here"

if (-not $hasProjectId) {
    Write-Host "📝 Создаем новый EAS проект..." -ForegroundColor Yellow
    
    Set-Location (Join-Path $PSScriptRoot "..")
    eas build:configure
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Ошибка создания EAS проекта" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ EAS проект создан" -ForegroundColor Green
} else {
    Write-Host "✅ EAS проект уже настроен (ID: $($appJson.expo.extra.eas.projectId))" -ForegroundColor Green
}

Write-Host ""

# Информация о следующих шагах
Write-Host "✅ EAS Build настроен успешно!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Следующие шаги:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Для Android:" -ForegroundColor Yellow
Write-Host "   - Создайте проект в Google Play Console" -ForegroundColor White
Write-Host "   - Скачайте google-services.json из Firebase" -ForegroundColor White
Write-Host "   - Создайте Service Account для автоматической публикации" -ForegroundColor White
Write-Host ""
Write-Host "2️⃣  Для iOS:" -ForegroundColor Yellow
Write-Host "   - Зарегистрируйтесь в Apple Developer Program (\$99/год)" -ForegroundColor White
Write-Host "   - Создайте App ID в Apple Developer Portal" -ForegroundColor White
Write-Host "   - EAS автоматически создаст сертификаты при первой сборке" -ForegroundColor White
Write-Host ""
Write-Host "3️⃣  Тестовая сборка:" -ForegroundColor Yellow
Write-Host "   npm run build:preview:android  # APK для тестирования" -ForegroundColor White
Write-Host "   npm run build:preview:ios      # iOS для TestFlight" -ForegroundColor White
Write-Host ""
Write-Host "4️⃣  Production сборка:" -ForegroundColor Yellow
Write-Host "   npm run build:production:android  # AAB для Play Store" -ForegroundColor White
Write-Host "   npm run build:production:ios      # iOS для App Store" -ForegroundColor White
Write-Host ""
Write-Host "📚 Документация: https://docs.expo.dev/build/introduction/" -ForegroundColor Cyan
Write-Host ""
