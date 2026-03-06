const nodemailer = require('nodemailer');

// Email transporter configuration
// Using Ethereal Email for testing (free, no config needed)
let transporter;

async function initEmailService() {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: 'jairo.ankunding@ethereal.email',
                pass: 'S86M6GxmvdJvWjVUVM'
            }
        });
    }
}

// Email template functions
const emailTemplates = {
    welcome: (userName, userEmail) => ({
        subject: '🌸 Welcome to Blossom Farm!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #8B5BA1 0%, #D84A8A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1>🌸 Welcome to Blossom Farm!</h1>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
                    <p>Hi ${userName},</p>
                    
                    <p>Thank you for joining our growing community of flower lovers! We're thrilled to have you at Blossom Farm.</p>
                    
                    <p><strong>What you can do now:</strong></p>
                    <ul>
                        <li>Browse our fresh flower arrangements in the Shop</li>
                        <li>Subscribe to our CSA membership for weekly bouquets</li>
                        <li>View your account and manage your orders</li>
                        <li>Check our planting calendar to see what's in season</li>
                    </ul>
                    
                    <p style="margin: 30px 0; text-align: center;">
                        <a href="http://localhost:3000/shop.html" style="background: linear-gradient(135deg, #8B5BA1 0%, #D84A8A 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            🛒 Shop Now
                        </a>
                    </p>
                    
                    <p>If you have any questions, reply to this email or visit our Contact page.</p>
                    
                    <p>Happy blooming!<br/>
                    <strong>The Blossom Farm Team</strong></p>
                </div>
                
                <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999;">
                    <p>© 2026 Blossom Farm. All rights reserved.</p>
                </div>
            </div>
        `
    }),

    csaSubscription: (userName, tier, frequency, pickupLocation, value) => ({
        subject: '🥗 CSA Subscription Confirmed - Blossom Farm',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #8B5BA1 0%, #D84A8A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1>🥗 CSA Subscription Confirmed!</h1>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
                    <p>Hi ${userName},</p>
                    
                    <p>Your CSA membership is now active! Get ready for beautiful, fresh flowers delivered every week.</p>
                    
                    <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #D84A8A;">
                        <h3 style="margin-top: 0; color: #8B5BA1;">Your Subscription Details</h3>
                        <p><strong>Tier:</strong> ${tier}</p>
                        <p><strong>Frequency:</strong> ${frequency}</p>
                        <p><strong>Pickup Location:</strong> ${pickupLocation}</p>
                        <p><strong>Value Per Box:</strong> $${value}</p>
                    </div>
                    
                    <p><strong>Important:</strong> Your first box will be ready for pickup on the specified pickup date. Check your account dashboard for exact dates and availability.</p>
                    
                    <p>We'll send you a reminder email each week with the contents of your CSA box and where to pick it up.</p>
                    
                    <p style="margin: 30px 0; text-align: center;">
                        <a href="http://localhost:3000/account.html" style="background: linear-gradient(135deg, #8B5BA1 0%, #D84A8A 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            📋 View My Account
                        </a>
                    </p>
                    
                    <p>Questions about your subscription? Contact us anytime!</p>
                    
                    <p>Happy blooming!<br/>
                    <strong>The Blossom Farm Team</strong></p>
                </div>
                
                <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999;">
                    <p>© 2026 Blossom Farm. All rights reserved.</p>
                </div>
            </div>
        `
    }),

    orderConfirmation: (userName, orderId, items, totalPrice, orderType, pickupLocation) => ({
        subject: `📦 Order #${orderId} Confirmed - Blossom Farm`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #8B5BA1 0%, #D84A8A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1>📦 Order Confirmed!</h1>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
                    <p>Hi ${userName},</p>
                    
                    <p>Thank you for your order! We've received it and will prepare your flowers with care.</p>
                    
                    <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #8B5BA1;">Order Details</h3>
                        <p><strong>Order #:</strong> ${orderId}</p>
                        <p><strong>Type:</strong> ${orderType}</p>
                        <p><strong>Status:</strong> Pending Preparation</p>
                        <p><strong>Pickup Location:</strong> ${pickupLocation}</p>
                    </div>
                    
                    <h4 style="color: #8B5BA1;">Items Ordered:</h4>
                    <ul style="background: #f5f5f5; padding: 15px 30px; border-radius: 5px;">
                        ${items.map(item => `<li>${item.name} x${item.quantity}</li>`).join('')}
                    </ul>
                    
                    <div style="background: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; border-left: 4px solid #28a745;">
                        <p style="margin: 0; font-size: 24px; font-weight: bold; color: #155724;">
                            Total: $${totalPrice.toFixed(2)}
                        </p>
                    </div>
                    
                    <p><strong>Next Steps:</strong></p>
                    <ul>
                        <li>We'll prepare your flowers with care</li>
                        <li>You'll receive a "Ready for Pickup" email in 24 hours</li>
                        <li>Pick up your flowers at ${pickupLocation} during our business hours</li>
                    </ul>
                    
                    <p style="margin: 30px 0; text-align: center;">
                        <a href="http://localhost:3000/account.html" style="background: linear-gradient(135deg, #8B5BA1 0%, #D84A8A 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            📋 View Your Orders
                        </a>
                    </p>
                    
                    <p>Have questions? Reply to this email or contact us!</p>
                    
                    <p>Happy blooming!<br/>
                    <strong>The Blossom Farm Team</strong></p>
                </div>
                
                <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999;">
                    <p>© 2026 Blossom Farm. All rights reserved.</p>
                </div>
            </div>
        `
    }),

    orderReady: (userName, orderId, pickupLocation, pickupDate) => ({
        subject: `🌸 Your Order #${orderId} is Ready for Pickup!`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #8B5BA1 0%, #D84A8A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1>🌸 Your Order is Ready!</h1>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
                    <p>Hi ${userName},</p>
                    
                    <p>Great news! Your order has been prepared and is ready for pickup.</p>
                    
                    <div style="background: #e7f3ff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196F3; text-align: center;">
                        <p style="margin: 0; font-size: 18px; color: #1976D2;">
                            <strong>📍 Pickup Location:</strong><br/>
                            ${pickupLocation}<br/>
                            <strong>Ready until:</strong> ${pickupDate}
                        </p>
                    </div>
                    
                    <p><strong>Your Order:</strong></p>
                    <p>Order #${orderId} is packaged and waiting for you. Please pick it up at the location above to ensure freshness.</p>
                    
                    <p style="margin: 30px 0; text-align: center;">
                        <a href="http://localhost:3000/account.html" style="background: linear-gradient(135deg, #8B5BA1 0%, #D84A8A 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            📋 View Your Order
                        </a>
                    </p>
                    
                    <p style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
                        <strong>⏰ Reminder:</strong> For the freshest flowers, please pick up within 24 hours of this email.
                    </p>
                    
                    <p>If you have any questions, reply to this email!</p>
                    
                    <p>Happy blooming!<br/>
                    <strong>The Blossom Farm Team</strong></p>
                </div>
                
                <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999;">
                    <p>© 2026 Blossom Farm. All rights reserved.</p>
                </div>
            </div>
        `
    }),

    csaWeeklyBox: (userName, boxTheme, smallContents, mediumContents, largeContents) => ({
        subject: `🥗 This Week's CSA Box: ${boxTheme}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #8B5BA1 0%, #D84A8A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1>🥗 This Week's CSA Box</h1>
                    <h2 style="font-size: 24px; margin: 0;">Theme: ${boxTheme}</h2>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
                    <p>Hi ${userName},</p>
                    
                    <p>This week we've curated a special box filled with the freshest flowers from our farm!</p>
                    
                    <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #8B5BA1;">📦 Small Box</h3>
                        <p>${smallContents}</p>
                    </div>
                    
                    <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #8B5BA1;">📦 Medium Box</h3>
                        <p>${mediumContents}</p>
                    </div>
                    
                    <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #8B5BA1;">📦 Large Box</h3>
                        <p>${largeContents}</p>
                    </div>
                    
                    <p><strong>Pickup Information:</strong></p>
                    <ul>
                        <li>Boxes will be available for pickup starting Friday at 3pm</li>
                        <li>Please pick up by end of business hours on Sunday</li>
                        <li>Your subscription includes one box per delivery period</li>
                    </ul>
                    
                    <p style="margin: 30px 0; text-align: center;">
                        <a href="http://localhost:3000/csa.html" style="background: linear-gradient(135deg, #8B5BA1 0%, #D84A8A 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            🥗 View CSA Options
                        </a>
                    </p>
                    
                    <p style="background: #efe; padding: 15px; border-radius: 5px; border-left: 4px solid #3c3;">
                        <strong>💚 Tip:</strong> Visit our blog for flower care tips and arrangement ideas!
                    </p>
                    
                    <p>Enjoy your flowers!<br/>
                    <strong>The Blossom Farm Team</strong></p>
                </div>
                
                <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999;">
                    <p>© 2026 Blossom Farm. All rights reserved.</p>
                </div>
            </div>
        `
    })
};

// Email sending functions
async function sendWelcomeEmail(userName, userEmail) {
    try {
        await initEmailService();
        const emailContent = emailTemplates.welcome(userName, userEmail);
        
        const info = await transporter.sendMail({
            from: '"Blossom Farm" <noreply@blossomfarm.com>',
            to: userEmail,
            subject: emailContent.subject,
            html: emailContent.html
        });
        
        console.log('Welcome email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return { success: false, error: error.message };
    }
}

async function sendCSASubscriptionEmail(userName, userEmail, tier, frequency, pickupLocation, value) {
    try {
        await initEmailService();
        const emailContent = emailTemplates.csaSubscription(userName, tier, frequency, pickupLocation, value);
        
        const info = await transporter.sendMail({
            from: '"Blossom Farm" <noreply@blossomfarm.com>',
            to: userEmail,
            subject: emailContent.subject,
            html: emailContent.html
        });
        
        console.log('CSA subscription email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending CSA subscription email:', error);
        return { success: false, error: error.message };
    }
}

async function sendOrderConfirmationEmail(userName, userEmail, orderId, items, totalPrice, orderType, pickupLocation) {
    try {
        await initEmailService();
        const emailContent = emailTemplates.orderConfirmation(userName, orderId, items, totalPrice, orderType, pickupLocation);
        
        const info = await transporter.sendMail({
            from: '"Blossom Farm" <noreply@blossomfarm.com>',
            to: userEmail,
            subject: emailContent.subject,
            html: emailContent.html
        });
        
        console.log('Order confirmation email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending order confirmation email:', error);
        return { success: false, error: error.message };
    }
}

async function sendOrderReadyEmail(userName, userEmail, orderId, pickupLocation, pickupDate) {
    try {
        await initEmailService();
        const emailContent = emailTemplates.orderReady(userName, orderId, pickupLocation, pickupDate);
        
        const info = await transporter.sendMail({
            from: '"Blossom Farm" <noreply@blossomfarm.com>',
            to: userEmail,
            subject: emailContent.subject,
            html: emailContent.html
        });
        
        console.log('Order ready email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending order ready email:', error);
        return { success: false, error: error.message };
    }
}

async function sendCSAWeeklyBoxEmail(userName, userEmail, boxTheme, smallContents, mediumContents, largeContents) {
    try {
        await initEmailService();
        const emailContent = emailTemplates.csaWeeklyBox(userName, boxTheme, smallContents, mediumContents, largeContents);
        
        const info = await transporter.sendMail({
            from: '"Blossom Farm" <noreply@blossomfarm.com>',
            to: userEmail,
            subject: emailContent.subject,
            html: emailContent.html
        });
        
        console.log('CSA weekly box email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending CSA weekly box email:', error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    initEmailService,
    sendWelcomeEmail,
    sendCSASubscriptionEmail,
    sendOrderConfirmationEmail,
    sendOrderReadyEmail,
    sendCSAWeeklyBoxEmail
};
