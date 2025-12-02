# 🚀 دليل النشر على GitHub و Vercel | Deployment Guide

هذا الدليل يشرح خطوة بخطوة كيفية رفع المشروع على GitHub ونشره على Vercel.

This guide explains step-by-step how to upload the project to GitHub and deploy it on Vercel.

---

## 📋 المتطلبات | Requirements

- [ ] حساب GitHub (مجاني) | GitHub account (free)
- [ ] حساب Vercel (مجاني) | Vercel account (free)
- [ ] Git مثبت على جهازك | Git installed on your machine

---

## 1️⃣ رفع المشروع على GitHub | Upload to GitHub

### الخطوة 1: إنشاء Repository على GitHub

1. اذهب إلى [github.com](https://github.com)
2. سجّل دخول أو أنشئ حساب جديد
3. انقر على زر **"New"** أو **"+"** → **"New repository"**
4. املأ التفاصيل:
   - **Repository name**: `web-audio-enhancer-v2` (أو أي اسم تريده)
   - **Description**: "Advanced audio enhancement web application"
   - **Visibility**: اختر Public أو Private
   - **لا تختر** ✅ أي من خيارات initialize (README، gitignore، license)
5. انقر **"Create repository"**

### الخطوة 2: تكوين Git محلياً

افتح Terminal/PowerShell في مجلد المشروع وقم بتشغيل الأوامر التالية:

```powershell
# تأكد من أن git مُكوّن باسمك وإيميلك
git config user.name "Your Name"
git config user.email "your.email@example.com"

# التحقق من حالة Git
git status
```

### الخطوة 3: إضافة الملفات والرفع

```powershell
# إضافة جميع الملفات
git add .

# إنشاء أول commit
git commit -m "Initial commit: Audio Enhancer v2"

# ربط المشروع بـ GitHub (استبدل USERNAME و REPO-NAME بمعلوماتك)
git remote add origin https://github.com/USERNAME/REPO-NAME.git

# رفع الملفات
git branch -M main
git push -u origin main
```

> **ملاحظة**: ستحتاج لإدخال اسم المستخدم وكلمة المرور الخاصة بـ GitHub.
> في حالة طلب `Personal Access Token` بدلاً من كلمة المرور، يمكنك إنشاء واحد من:
> GitHub → Settings → Developer settings → Personal access tokens → Generate new token

### ✅ التحقق

- افتح repository الخاص بك على GitHub
- تأكد من ظهور جميع الملفات

---

## 2️⃣ النشر على Vercel | Deploy to Vercel

### الخطوة 1: إنشاء حساب Vercel

1. اذهب إلى [vercel.com](https://vercel.com)
2. انقر على **"Sign Up"**
3. اختر **"Continue with GitHub"** لربط حسابك بـ GitHub
4. امنح Vercel الصلاحيات المطلوبة

### الخطوة 2: استيراد المشروع

1. من لوحة تحكم Vercel، انقر على **"Add New..."** → **"Project"**
2. سترى قائمة بجميع repositories الخاصة بك على GitHub
3. ابحث عن `web-audio-enhancer-v2` وانقر **"Import"**

### الخطوة 3: تكوين المشروع

Vercel سيكتشف تلقائياً أنه مشروع Vite. تأكد من الإعدادات التالية:

- **Framework Preset**: Vite
- **Root Directory**: `./` (سيتم استخدام `vercel.json` للإعدادات)
- **Build Command**: `cd audio-enhancer-react && npm install && npm run build`
- **Output Directory**: `audio-enhancer-react/dist`
- **Install Command**: يتم تلقائياً

> **ملاحظة**: هذه الإعدادات موجودة في ملف `vercel.json` ولا تحتاج لتغيير شيء!

### الخطوة 4: النشر

1. انقر **"Deploy"**
2. انتظر بضع ثواني حتى يكتمل البناء والنشر (عادة 1-2 دقيقة)
3. ستحصل على رابط مثل: `https://your-project.vercel.app`

### ✅ التحقق

- افتح الرابط الذي أعطاك إياه Vercel
- جرّب رفع ملف صوتي
- تأكد من أن جميع المميزات تعمل

---

## 3️⃣ التحديثات المستقبلية | Future Updates

### طريقة التحديث التلقائي

كلما قمت برفع تحديثات جديدة على GitHub، Vercel سينشرها تلقائياً:

```powershell
# بعد إجراء تعديلات على الكود
git add .
git commit -m "وصف التعديلات"
git push
```

Vercel سيكتشف التحديث ويقوم بالنشر تلقائياً خلال دقائق!

### إعدادات إضافية على Vercel

من لوحة تحكم Vercel يمكنك:
- **Custom Domain**: ربط نطاق خاص بك
- **Environment Variables**: إضافة متغيرات بيئية
- **Analytics**: تتبع زوار الموقع
- **Preview Deployments**: معاينة التغييرات قبل النشر

---

## 🔧 استكشاف الأخطاء | Troubleshooting

### مشكلة: Git لا يعمل

```powershell
# تثبيت Git من:
# https://git-scm.com/download/win
```

### مشكلة: Vercel Build Failed

- تحقق من أن ملف `vercel.json` موجود في الجذر
- تأكد من أن `package.json` في مجلد `audio-enhancer-react`
- راجع Logs في Vercel لمعرفة الخطأ بالتحديد

### مشكلة: 404 Not Found بعد التحديث

- تأكد من أن `rewrites` موجودة في `vercel.json`
- هذا يضمن أن React Router يعمل بشكل صحيح

### مشكلة: التطبيق لا يعمل على Vercel

- افتح Developer Console في المتصفح
- تحقق من الأخطاء
- تأكد من أن جميع الملفات في `public/` موجودة

---

## 📞 دعم | Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **GitHub Help**: [docs.github.com](https://docs.github.com)
- **Vite Documentation**: [vitejs.dev](https://vitejs.dev)

---

## 🎉 تهانينا! | Congratulations!

الآن مشروعك منشور على الإنترنت ويمكن لأي شخص الوصول إليه! 🚀

Your project is now live and accessible to anyone! 🚀
