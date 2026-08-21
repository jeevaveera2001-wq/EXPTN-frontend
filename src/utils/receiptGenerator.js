import { jsPDF } from 'jspdf';

/**
 * Generates and immediately downloads an official vector PDF Tax Invoice & Stay Voucher.
 * @param {Object} bk - The booking object
 */
export const downloadBookingReceiptPDF = (bk) => {
  if (!bk) return;

  const bkId = bk.bookingId || bk.id || 'ETN-BK-REF';
  const bkTitle = bk.itemTitle || bk.propertyTitle || bk.title || 'Verified Luxury Stay';
  const bkLocation = bk.destination || bk.location || 'Tamil Nadu';
  const bkAmount = Number(bk.totalAmount || bk.amount || 0);
  const baseRate = Number(bk.baseRate || Math.round(bkAmount / 1.23) || bkAmount);
  const gstAmount = Number(bk.gstAmount || Math.round(baseRate * 0.18) || 0);
  const serviceFee = Number(bk.serviceFee || Math.round(baseRate * 0.05) || (bkAmount - baseRate - gstAmount));
  const guestName = bk.customerName || bk.userName || 'Tourist Guest';
  const guestEmail = bk.customerEmail || bk.userEmail || 'guest@exploretamilnadu.com';
  const guestPhone = bk.customerPhone || bk.userPhone || '+91 78717 79134';
  const checkIn = bk.checkIn || bk.checkInDate || '2026-08-25';
  const checkOut = bk.checkOut || bk.checkOutDate || '2026-08-28';
  const nights = bk.nights || 1;
  const guests = bk.guests || 2;
  const guestType = bk.guestType || 'Stay';
  const hostName = bk.ownerName || 'Verified Host';
  const paymentId = bk.paymentId || 'pay_rzp_captured';
  const paymentMethod = bk.paymentMethod || 'Razorpay Gateway (UPI / Cards)';
  const issueDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  // 1. Initialize A4 Document (210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2); // 180mm

  // --- HEADER BRANDING BAR ---
  doc.setFillColor(6, 24, 51); // Dark Navy #061833
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('EXPLORE TAMIL NADU', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.text('OFFICIAL TAX INVOICE & HOTEL STAY PASS VOUCHER', margin, 18);
  doc.text('GSTIN: 33AAACE2026TN1Z8 | Helpline: +91 78717 79134', margin, 23);

  // Status Badge on Header Right
  doc.setFillColor(16, 185, 129); // Emerald
  doc.roundedRect(pageWidth - margin - 50, 7, 50, 14, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('PAID VIA RAZORPAY', pageWidth - margin - 25, 15.5, { align: 'center' });

  // --- BOOKING METADATA BANNER ---
  let y = 36;
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'FD');

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('BOOKING REFERENCE ID', margin + 6, y + 6);
  doc.text('PAYMENT TRANSACTION ID', margin + 70, y + 6);
  doc.text('DATE OF ISSUE', margin + 140, y + 6);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(bkId, margin + 6, y + 14);

  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(paymentId.length > 20 ? paymentId.substring(0, 20) + '...' : paymentId, margin + 70, y + 14);
  doc.text(issueDate, margin + 140, y + 14);

  // --- 2-COLUMN DETAILS BOXES ---
  y += 26;
  const colWidth = (contentWidth - 6) / 2; // 87mm each

  // Left Column: Guest Details Box
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, y, colWidth, 44, 2, 2, 'FD');
  
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, colWidth, 8, 2, 2, 'F');
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('GUEST / CUSTOMER DETAILS', margin + 4, y + 5.5);

  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Name:', margin + 4, y + 15);
  doc.text('Email:', margin + 4, y + 22);
  doc.text('Phone:', margin + 4, y + 29);
  doc.text('Guests:', margin + 4, y + 36);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(guestName, margin + 22, y + 15);
  doc.setFont('helvetica', 'normal');
  doc.text(guestEmail.length > 24 ? guestEmail.substring(0, 24) + '...' : guestEmail, margin + 22, y + 22);
  doc.text(guestPhone, margin + 22, y + 29);
  doc.text(`${guests} Guest(s) (${guestType})`, margin + 22, y + 36);

  // Right Column: Stay & Host Details Box
  const rightColX = margin + colWidth + 6;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(rightColX, y, colWidth, 44, 2, 2, 'FD');

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(rightColX, y, colWidth, 8, 2, 2, 'F');
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('PROPERTY & SCHEDULE DETAILS', rightColX + 4, y + 5.5);

  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Property:', rightColX + 4, y + 15);
  doc.text('Location:', rightColX + 4, y + 22);
  doc.text('Check-In:', rightColX + 4, y + 29);
  doc.text('Check-Out:', rightColX + 4, y + 36);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(bkTitle.length > 22 ? bkTitle.substring(0, 22) + '...' : bkTitle, rightColX + 22, y + 15);
  doc.setFont('helvetica', 'normal');
  doc.text(bkLocation, rightColX + 22, y + 22);
  doc.text(`${checkIn} (12:00 PM)`, rightColX + 22, y + 29);
  doc.text(`${checkOut} (11:00 AM) • ${nights}N`, rightColX + 22, y + 36);

  // --- ITEMIZED BILLING TABLE ---
  y += 50;
  doc.setFillColor(6, 24, 51);
  doc.roundedRect(margin, y, contentWidth, 8, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('ITEM DESCRIPTION', margin + 4, y + 5.5);
  doc.text('DURATION / TYPE', margin + 85, y + 5.5);
  doc.text('RATE (INR)', margin + 130, y + 5.5);
  doc.text('AMOUNT (INR)', margin + 176, y + 5.5, { align: 'right' });

  // Row 1: Base Tariff
  y += 8;
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, y, contentWidth, 12, 'F');
  doc.setDrawColor(241, 245, 249);
  doc.line(margin, y + 12, margin + contentWidth, y + 12);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(bkTitle.length > 35 ? bkTitle.substring(0, 35) + '...' : bkTitle, margin + 4, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Verified Accommodation • ${bkLocation}`, margin + 4, y + 9);

  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`${nights} Night(s)`, margin + 85, y + 6);
  doc.text(`Rs. ${Math.round(baseRate / nights).toLocaleString()}`, margin + 130, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.text(`Rs. ${baseRate.toLocaleString()}`, margin + 176, y + 6, { align: 'right' });

  // Row 2: GST
  y += 12;
  doc.rect(margin, y, contentWidth, 10, 'F');
  doc.line(margin, y + 10, margin + contentWidth, y + 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Goods & Services Tax (GST 18%)', margin + 4, y + 6);
  doc.text('Standard 18%', margin + 85, y + 6);
  doc.text('18%', margin + 130, y + 6);
  doc.text(`+ Rs. ${gstAmount.toLocaleString()}`, margin + 176, y + 6, { align: 'right' });

  // Row 3: Platform Fee
  y += 10;
  doc.rect(margin, y, contentWidth, 10, 'F');
  doc.line(margin, y + 10, margin + contentWidth, y + 10);
  doc.text('Platform & Reservation Facilitation Fee (5%)', margin + 4, y + 6);
  doc.text('Service Fee', margin + 85, y + 6);
  doc.text('5%', margin + 130, y + 6);
  doc.text(`+ Rs. ${serviceFee.toLocaleString()}`, margin + 176, y + 6, { align: 'right' });

  // Total Summary Row
  y += 10;
  doc.setFillColor(240, 253, 244); // Emerald 50
  doc.setDrawColor(187, 247, 208); // Emerald 200
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'FD');

  doc.setTextColor(6, 95, 70); // Emerald 800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TOTAL AMOUNT PAID (INR)', margin + 6, y + 9);

  doc.setFontSize(13);
  doc.text(`Rs. ${bkAmount.toLocaleString()}`, margin + 174, y + 9.5, { align: 'right' });

  // --- CHECK-IN & VOUCHER VALIDATION INSTRUCTIONS ---
  y += 20;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('IMPORTANT CHECK-IN GUIDELINES', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('1. Please present this official PDF voucher or your Booking ID at the hotel reception during check-in.', margin + 4, y + 11);
  doc.text('2. All adult guests must present a valid Government-issued photo ID proof (Aadhaar / Passport / Driving License).', margin + 4, y + 16);
  doc.text('3. Standard Check-In: 12:00 PM | Standard Check-Out: 11:00 AM. For special requests, contact helpline +91 78717 79134.', margin + 4, y + 21);

  // --- FOOTER BRANDING ---
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, 280, pageWidth - margin, 280);

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('© 2026 Explore Tamil Nadu Tourism & Reservations Platform. All Rights Reserved.', margin, 285);
  doc.text('This is an authentic computer-generated tax invoice and requires no physical signature.', pageWidth - margin, 285, { align: 'right' });

  // 💾 Trigger Direct Download in Browser
  const fileName = `Explore_TamilNadu_Receipt_${bkId}.pdf`;
  doc.save(fileName);
};
