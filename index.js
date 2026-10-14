const { Bot, InlineKeyboard } = require("grammy");
const express = require("express");
const app = express();

// 1. محرك البوت التلقائي المربوط بالتوكن والـ ID الخاص بك
const bot = new Bot("8605565677:AAHUYK1LBv3m4d9YXDCCly4UnXwtjGrrVL0");
const ADMIN_ID = "8876592472"; 
const CHANNEL_USERNAME = "@alknze"; // تم إضافة معرف قناتك هنا بدقة داخل علامات التنصيص

// 2. ميزة استدعاء البوت بالكلمة المفتاحية للآدمن
bot.hears("لوحة التحكم", async (ctx) => {
    if (ctx.from.id == ADMIN_ID) {
        await ctx.reply("⚡ أهلاً بك يا مدير المتجر، إليك لوحة التحكم السريعة لمتجر ببجي:", {
            reply_markup: new InlineKeyboard()
                .text("📊 الطلبات المعلقة", "view_pending")
                .text("⚙️ تعديل الأسعار", "edit_prices")
        });
    }
});

// 3. استقبال طلب الشحن اليدوي من المتجر المصغر
bot.on("web_app_data", async (ctx) => {
    const data = JSON.parse(ctx.webAppData.data);
    await bot.api.sendMessage(ADMIN_ID, `
📦 **طلب شحن يدوي جديد:**
👤 حساب الزبون: ${ctx.from.first_name}
🆔 معرف اللاعب (ID): \`\${data.playerId}\`
💎 الباقة المطلوبة: ${data.ucAmount} UC
    `, {
        reply_markup: new InlineKeyboard()
            .text("✅ تم الشحن والقبول", `approve_${data.playerId}_${data.ucAmount}_${ctx.from.id}`)
            .text("❌ رفض الطلب", `reject_${ctx.from.id}`)
    });
});

// 4. معالجة الأزرار والرد التلقائي على الزبون في الخاص وإثبات المصداقية المشفر في القناة
bot.on("callback_query:data", async (ctx) => {
    const action = ctx.callbackQuery.data;
    
    if (action.startsWith("approve_")) {
        const [_, playerId, ucAmount, userId] = action.split("_");
        
        try {
            await bot.api.sendMessage(userId, "🚀 **مرحباً بك! تم التحقق من عملية الدفع وشحن حسابك بنجاح. شكراً لثقتك بمتجرنا!**");
        } catch (err) { console.log(err); }
        
        // تشفير الـ ID تلقائياً لحماية الخصوصية
        const maskedId = playerId.length > 4 
            ? playerId.substring(0, 3) + "****" + playerId.slice(-1) 
            : "******";
        
        try {
            await bot.api.sendMessage(CHANNEL_USERNAME, `🎉 **عملية شحن ناجحة جديدة!**\n\nتم شحن باقة **${ucAmount} UC** بنجاح للاعب ID: \`\${maskedId}\`\n\nشكراً لثقتكم بمتجرنا المعتمد ⚡`);
        } catch (err) { console.log(err); }
        
        await ctx.answerCallbackQuery("تم الشحن ونشر الإثبات بالقناة! ✅");
        await ctx.editMessageText(ctx.callbackQuery.message.text + "\n\n🟢 [حالة الطلب: تم القبول والشحن]");
    }
    
    if (action.startsWith("reject_")) {
        const [_, userId] = action.split("_");
        try {
            await bot.api.sendMessage(userId, "⚠️ **نأسف، تم رفض طلب الشحن الخاص بك. السبب: لم يتم العثور على عملية دفع مطابقة. يرجى التواصل مع الدعم الفني.**");
        } catch (err) { console.log(err); }
        await ctx.answerCallbackQuery("تم الرفض ❌");
        await ctx.editMessageText(ctx.callbackQuery.message.text + "\n\n🔴 [حالة الطلب: تم الرفض]");
    }
});

// 5. واجهة المتجر المضيئة المدمجة المحمية من اللمس المتعدد والحروف
const storeHtml = `
<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>متجر شحن ببجي</title>
    <script src="https://telegram.org"></script>
    <style>
        body { font-family: 'Segoe UI', sans-serif; background-color: #0b0e14; color: #ffffff; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; direction: rtl; -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
        .store-container { background-color: #151a24; padding: 30px; border-radius: 15px; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5); width: 100%; max-width: 500px; }
        .store-header { text-align: center; margin-bottom: 30px; }
        .pubg-logo { background: #f3a91e; color: #000; font-weight: 900; padding: 5px 15px; display: inline-block; font-size: 14px; border-radius: 4px; margin-bottom: 10px; }
        .store-header h1 { font-size: 24px; margin: 5px 0; color: #f3a91e; }
        .store-header p { font-size: 13px; color: #8fa0b4; }
        .section-box { background-color: #1c2331; padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #2c374e; }
        .section-title { font-size: 16px; font-weight: bold; color: #f3a91e; margin-bottom: 15px; }
        .input-wrapper { position: relative; width: 100%; height: 45px; }
        .input-wrapper input { width: 100%; height: 100%; padding: 10px 15px; border: 2px solid #2c374e; border-radius: 6px; box-sizing: border-box; font-size: 15px; background: #151a24; color: #fff; outline: none; position: relative; z-index: 2; transition: border-color 0.3s; }
        .input-wrapper input:focus { border-color: transparent; }
        .border-svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; pointer-events: none; }
        .border-rect { fill: none; stroke: #f3a91e; stroke-width: 3px; stroke-linecap: round; stroke-dasharray: 100 350; stroke-dashoffset: 0; visibility: hidden; }
        .input-wrapper input:focus ~ .border-svg .border-rect { visibility: visible; animation: laserRun 2s linear infinite; }
        @keyframes laserRun { from { stroke-dashoffset: 450; } to { stroke-dashoffset: 0; } }
        .uc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .uc-card { background-color: #151a24; border: 2px solid #2c374e; border-radius: 8px; padding: 15px; text-align: center; position: relative; cursor: pointer; transition: all 0.15s ease; user-select: none; }
        .uc-card.active { border-color: #f3a91e; background-color: rgba(243, 169, 30, 0.05); box-shadow: 0 0 10px rgba(243, 169, 30, 0.2); }
        .uc-badge { position: absolute; top: -10px; left: 50%; transform: translateX(-50%); background: #e74c3c; color: white; font-size: 10px; padding: 2px 8px; border-radius: 10px; font-weight: bold; }
        .uc-amount { font-size: 20px; font-weight: bold; color: #fff; }
        .uc-bonus { font-size: 12px; color: #2ecc71; margin: 2px 0 8px 0; }
        .uc-price { font-size: 14px; color: #f3a91e; font-weight: bold; background: #1c2331; padding: 4px; border-radius: 4px; }
        .charge-btn { width: 100%; padding: 15px; background-color: #f3a91e; color: #000; border: none; border-radius: 8px; font-size: 18px; font-weight: bold; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(243, 169, 30, 0.3); margin-top: 10px; }
    </style>
</head>
<body>
    <div class="store-container">
        <div class="store-header"><div class="pubg-logo">PUBG MOBILE</div><h1>مركز شحن الشدات المعتمد</h1><p>اشحن حسابك فوراً وبأمان عبر المعرّف (ID)</p></div>
        <div class="section-box">
            <div class="section-title">1. أدخل بيانات الحساب</div>
            <div class="input-wrapper">
                <input type="tel" id="player-id" placeholder="اكتب الـ ID الرقمي هنا..." oninput="this.value = this.value.replace(/[^0-9]/g, '');">
                <svg class="border-svg" width="100%" height="100%"><rect class="border-rect" x="1.5" y="1.5" width="calc(100% - 3px)" height="calc(100% - 3px)" rx="5" ry="5"></rect></svg>
            </div>
        </div>
        <div class="section-box">
            <div class="section-title">2. اختر كمية الشدات (UC)</div>
            <div class="uc-grid">
                <div class="uc-card" data-id="1" data-amount="60" onclick="secureSelect(this)"><div class="uc-amount">60 UC</div><div class="uc-bonus">+0 مجاناً</div><div class="uc-price">1.00 $</div></div>
                <div class="uc-card active" data-id="2" data-amount="325" onclick="secureSelect(this)"><div class="uc-badge">الأكثر طلباً</div><div class="uc-amount">325 UC</div><div class="uc-bonus">+25 مجاناً</div><div class="uc-price">4.99 $</div></div>
                <div class="uc-card" data-id="3" data-amount="660" onclick="secureSelect(this)"><div class="uc-amount">660 UC</div><div class="uc-bonus">+60 مجاناً</div><div class="uc-price">9.99 $</div></div>
                <div class="uc-card" data-id="4" data-amount="1800" onclick="secureSelect(this)"><div class="uc-amount">1800 UC</div><div class="uc-bonus">+200 مجاناً</div><div class="uc-price">24.99 $</div></div>
            </div>
        </div>
        <button type="button" class="charge-btn" onclick="submitToTelegram()">اشحن الآن ⚡</button>
    </div>
    <script>
        const tg = window.Telegram.WebApp; tg.expand(); let isProcessingClick = false;
        function secureSelect(element) {
            if (isProcessingClick) return; isProcessingClick = true;
            const selectedId = element.getAttribute('data-id');
            const allCards = document.querySelectorAll('.uc-card');
            allCards.forEach(card => card.classList.remove('active'));
            allCards.forEach(card => { if (card.getAttribute('data-id') === selectedId) card.classList.add('active'); });
            setTimeout(() => { isProcessingClick = false; }, 50);
        }
        function submitToTelegram() {
            const idInput = document.getElementById("player-id").value;
            const activeCard = document.querySelector(".uc-card.active");
            if (!idInput) { alert("الرجاء إدخال الـ ID الخاص بك أولاً!"); return; }
            tg.sendData(JSON.stringify({ playerId: idInput, ucAmount: activeCard.getAttribute("data-amount") }));
            tg.close();
        }
    </script>
</body>
</html>
`;

app.get("/", (req, res) => { res.send(storeHtml); });
app.listen(3000, () => { bot.start(); });
