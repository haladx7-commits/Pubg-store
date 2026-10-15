const { Bot, InlineKeyboard } = require("grammy");
const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

const bot = new Bot("8605565677:AAHUYK1LBv3m4d9YXDCCly4UnXwtjGrrVL0");
const ADMIN_ID = "8876592472"; 
const CHANNEL_USERNAME = "@alknze"; 

// تشغيل البوت وإظهار زر المتجر
bot.command("start", async (ctx) => {
    await ctx.reply("🔥 أهلاً بك في متجر الكنزي المعتمد لشحن شدات ببجي!\n\nاضغط على الزر بالأسفل لفتح المتجر المضيء وبدء الشحن فوراً ⚡", {
        reply_markup: new InlineKeyboard().webApp("فتح المتجر ⚡", "https://onrender.com")
    });
});

bot.hears("لوحة التحكم", async (ctx) => {
    if (ctx.from.id == ADMIN_ID) {
        await ctx.reply("⚡ أهلاً بك يا مدير المتجر، إليك لوحة التحكم السريعة لمتجر ببجي:", {
            reply_markup: new InlineKeyboard()
                .text("📊 الطلبات المعلقة", "view_pending")
                .text("⚙️ تعديل الأسعار", "edit_prices")
        });
    }
});

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

bot.on("callback_query:data", async (ctx) => {
    const action = ctx.callbackQuery.data;
    if (action.startsWith("approve_")) {
        const [_, playerId, ucAmount, userId] = action.split("_");
        try { await bot.api.sendMessage(userId, "🚀 **مرحباً بك! تم التحقق من عملية الدفع وشحن حسابك بنجاح. شكراً لثقتك بمتجرنا!**"); } catch (err) { console.log(err); }
        const maskedId = playerId.length > 4 ? playerId.substring(0, 3) + "****" + playerId.slice(-1) : "******";
        try { await bot.api.sendMessage(CHANNEL_USERNAME, `🎉 **عملية شحن ناجحة جديدة!**\n\nتم شحن باقة **${ucAmount} UC** بنجاح للاعب ID: \`\${maskedId}\`\n\nشكراً لثقتكم بمتجرنا المعتمد ⚡`); } catch (err) { console.log(err); }
        await ctx.answerCallbackQuery("تم الشحن ونشر الإثبات بالقناة! ✅");
        await ctx.editMessageText(ctx.callbackQuery.message.text + "\n\n🟢 [حالة الطلب: تم القبول والشحن]");
    }
    if (action.startsWith("reject_")) {
        const [_, userId] = action.split("_");
        try { await bot.api.sendMessage(userId, "⚠️ **نأسف، تم رفض طلب الشحن الخاص بك. السبب: لم يتم العثور على عملية دفع مطابقة. يرجى التواصل مع الدعم الفني.**"); } catch (err) { console.log(err); }
        await ctx.answerCallbackQuery("تم الرفض ❌");
        await ctx.editMessageText(ctx.callbackQuery.message.text + "\n\n🔴 [حالة الطلب: تم الرفض]");
    }
});

// قراءة ملف الواجهة المستقل بشكل نظيف وآمن لمنع خطأ البناء
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(3000, () => {
    bot.start();
});
