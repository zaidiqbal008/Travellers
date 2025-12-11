const PDFDocument = require('pdfkit');
const fs = require('fs-extra');
const path = require('path');

class PDFGenerator {
  constructor() {
    this.uploadsDir = path.join(__dirname, '../uploads/transcripts');
    this.ensureUploadsDirectory();
  }

  ensureUploadsDirectory() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  generateTranscriptNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `TR-${timestamp}-${random}`;
  }

  async generateBookingTranscript(booking, user) {
    const transcriptNumber = this.generateTranscriptNumber();
    const fileName = `transcript_${transcriptNumber}.pdf`;
    const filePath = path.join(this.uploadsDir, fileName);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50
        });

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Header with Logo and Company Info
        doc.rect(0, 0, 595, 120)
           .fill('#1e3a8a')
           .moveDown();

        doc.fontSize(32)
           .font('Helvetica-Bold')
           .fillColor('white')
           .text('TRAVELLERS', 50, 30)
           .moveDown();

        doc.fontSize(14)
           .font('Helvetica')
           .fillColor('white')
           .text('Premium Travel Services', 50, 70)
           .text('Lahore, Pakistan', 50, 90)
           .moveDown();

        // Transcript Number and Date
        doc.fontSize(12)
           .font('Helvetica')
           .fillColor('#1e3a8a')
           .text(`Transcript Number: ${transcriptNumber}`, 50, 170)
           .text(`Generated: ${new Date().toLocaleString()}`, 50, 185)
           .moveDown();

        doc.fillColor('black');

        // Customer Information
        let y = 220;
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text('CUSTOMER INFORMATION', 50, y, { underline: true });
        y += 22;
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text('Name:', 50, y)
           .font('Helvetica')
           .text(booking.customerName, 120, y);
        y += 18;
        doc.font('Helvetica-Bold').text('Phone:', 50, y).font('Helvetica').text(booking.customerPhone, 120, y);

        // Booking Details
        y += 28;
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text('BOOKING DETAILS', 50, y, { underline: true });
        y += 22;
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text('Car Model:', 50, y).font('Helvetica').text(booking.carName, 150, y);
        y += 18;
        doc.font('Helvetica-Bold').text('Pickup Location:', 50, y).font('Helvetica').text(booking.pickupLocation, 150, y);
        y += 18;
        doc.font('Helvetica-Bold').text('Drop Location:', 50, y).font('Helvetica').text(booking.dropLocation, 150, y);
        y += 18;
        doc.font('Helvetica-Bold').text('Date:', 50, y).font('Helvetica').text(new Date(booking.date).toLocaleDateString(), 150, y);
        y += 18;
        doc.font('Helvetica-Bold').text('Time:', 50, y).font('Helvetica').text(booking.time, 150, y);
        y += 18;
        doc.font('Helvetica-Bold').text('Passengers:', 50, y).font('Helvetica').text(booking.passengers.toString(), 150, y);
        y += 18;
        doc.font('Helvetica-Bold').text('Total Amount:', 50, y).font('Helvetica').text(`Rs. ${booking.totalAmount}`, 150, y);
        y += 18;
        doc.font('Helvetica-Bold').text('Status:', 50, y).font('Helvetica').text(booking.status.toUpperCase(), 150, y);
        y += 18;
        doc.font('Helvetica-Bold').text('Payment Status:', 50, y).font('Helvetica').text(booking.paymentStatus.toUpperCase(), 150, y);
        y += 18;
        doc.font('Helvetica-Bold').text('Payment Method:', 50, y).font('Helvetica').text('Stripe (Visa/Mastercard)', 150, y);

        // Move main doc cursor below the details for next sections
        doc.y = Math.max(doc.y, y + 30);

        // Service Includes
        doc.moveDown(2);
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text('SERVICE INCLUDES', 50, doc.y, { underline: true });
        doc.moveDown(0.5);
        const services = [
          'Professional Driver',
          'Air-conditioned Vehicle',
          'Fuel Included',
          'Insurance Coverage',
          '24/7 Customer Support'
        ];
        services.forEach(service => {
          doc.fontSize(11)
           .font('Helvetica')
             .text(`• ${service}`, 60, doc.y)
             .moveDown(0.1);
        });

        doc.moveDown(1.5);
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text('TERMS & CONDITIONS', 50, doc.y, { underline: true });
        doc.moveDown(0.5);
        const terms = [
          '1. This transcript serves as proof of your booking with Travellers.',
          '2. Cancellation must be made 24 hours before the scheduled time.',
          '3. No refund for cancellations made less than 24 hours before.',
          '4. Driver will wait for 15 minutes at pickup location.',
          '5. Additional charges may apply for extra waiting time.',
          '6. For any queries, contact our customer support.',
          '7. Keep this document for your records.'
        ];
        terms.forEach(term => {
          doc.fontSize(10)
             .font('Helvetica')
             .text(term, 60, doc.y)
             .moveDown(0.1);
        });

        doc.moveDown(2);
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text('Thank you for choosing Travellers!', { align: 'center' })
           .moveDown();
        doc.fontSize(10)
           .font('Helvetica')
           .text('Contact: +92 300 1234567 | Email: info@travellers.com', { align: 'center' })
           .text('Website: www.travellers.com', { align: 'center' })
           .moveDown();
        doc.fontSize(8)
           .font('Helvetica-Oblique')
           .text('This is a computer-generated document and does not require a signature.', { align: 'center' });

        doc.end();

        stream.on('finish', () => {
          resolve({
            transcriptNumber,
            fileName,
            filePath,
            transcriptData: {
              bookingDetails: {
                carName: booking.carName,
                pickupLocation: booking.pickupLocation,
                dropLocation: booking.dropLocation,
                date: booking.date,
                time: booking.time,
                passengers: booking.passengers,
                totalAmount: booking.totalAmount,
                status: booking.status,
                paymentStatus: booking.paymentStatus,
                paymentMethod: 'Stripe (Visa/Mastercard)'
              },
              userDetails: {
                username: user.username,
                email: user.email,
                phone: user.phone
              },
              generatedAt: new Date()
            }
          });
        });

        stream.on('error', (error) => {
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  async generateTourTranscript(trip, user) {
    const transcriptNumber = this.generateTranscriptNumber();
    const fileName = `transcript_${transcriptNumber}.pdf`;
    const filePath = path.join(this.uploadsDir, fileName);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50
        });

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Header with Logo and Company Info
        doc.rect(0, 0, 595, 120)
           .fill('#1e3a8a')
           .moveDown();

        doc.fontSize(32)
           .font('Helvetica-Bold')
           .fillColor('white')
           .text('TRAVELLERS', 50, 30)
           .moveDown();

        doc.fontSize(14)
           .font('Helvetica')
           .fillColor('white')
           .text('Premium Travel Services', 50, 70)
           .text('Lahore, Pakistan', 50, 90)
           .moveDown();

        // Transcript Number and Date
        doc.fontSize(12)
           .font('Helvetica')
           .fillColor('#1e3a8a')
           .text(`Transcript Number: ${transcriptNumber}`, 50, 170)
           .text(`Generated: ${new Date().toLocaleString()}`, 50, 185)
           .moveDown();

        doc.fillColor('black');

        // Customer Information
        let y = 220;
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text('CUSTOMER INFORMATION', 50, y, { underline: true });
        y += 22;
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text('Name:', 50, y)
           .font('Helvetica')
           .text(trip.name, 120, y);
        y += 18;
        doc.font('Helvetica-Bold').text('Phone:', 50, y).font('Helvetica').text(trip.phone, 120, y);

        // Tour Details
        y += 28;
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text('TOUR DETAILS', 50, y, { underline: true });
        y += 22;
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text('Tour Type:', 50, y).font('Helvetica').text(trip.tourType, 150, y);
        y += 18;
        doc.font('Helvetica-Bold').text('Date:', 50, y).font('Helvetica').text(new Date(trip.date).toLocaleDateString(), 150, y);
        y += 18;
        doc.font('Helvetica-Bold').text('Time:', 50, y).font('Helvetica').text(trip.time, 150, y);
        y += 18;
        doc.font('Helvetica-Bold').text('Passengers:', 50, y).font('Helvetica').text(trip.passengers.toString(), 150, y);
        y += 18;
        doc.font('Helvetica-Bold').text('Total Amount:', 50, y).font('Helvetica').text(`Rs. ${trip.totalAmount}`, 150, y);
        y += 18;
        doc.font('Helvetica-Bold').text('Status:', 50, y).font('Helvetica').text(trip.status ? trip.status.toUpperCase() : 'N/A', 150, y);
        y += 18;
        doc.font('Helvetica-Bold').text('Payment Status:', 50, y).font('Helvetica').text(trip.paymentStatus ? trip.paymentStatus.toUpperCase() : 'N/A', 150, y);
        y += 18;
        doc.font('Helvetica-Bold').text('Payment Method:', 50, y).font('Helvetica').text('Stripe (Visa/Mastercard)', 150, y);
        if (trip.message) {
          y += 18;
          doc.font('Helvetica-Bold').text('Message:', 50, y).font('Helvetica').text(trip.message, 150, y);
        }

        doc.y = Math.max(doc.y, y + 30);

        // Service Includes
        doc.moveDown(2);
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text('SERVICE INCLUDES', 50, doc.y, { underline: true });
        doc.moveDown(0.5);
        const services = [
          'Professional Tour Guide',
          'Air-conditioned Vehicle',
          'Fuel Included',
          'Insurance Coverage',
          '24/7 Customer Support'
        ];
        services.forEach(service => {
          doc.fontSize(11)
           .font('Helvetica')
             .text(`• ${service}`, 60, doc.y)
             .moveDown(0.1);
        });

        doc.moveDown(1.5);
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text('TERMS & CONDITIONS', 50, doc.y, { underline: true });
        doc.moveDown(0.5);
        const terms = [
          '1. This transcript serves as proof of your tour booking with Travellers.',
          '2. Cancellation must be made 24 hours before the scheduled time.',
          '3. No refund for cancellations made less than 24 hours before.',
          '4. Guide/Driver will wait for 15 minutes at pickup location.',
          '5. Additional charges may apply for extra waiting time.',
          '6. For any queries, contact our customer support.',
          '7. Keep this document for your records.'
        ];
        terms.forEach(term => {
          doc.fontSize(10)
             .font('Helvetica')
             .text(term, 60, doc.y)
             .moveDown(0.1);
        });

        doc.moveDown(2);
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text('Thank you for choosing Travellers!', { align: 'center' })
           .moveDown();
        doc.fontSize(10)
           .font('Helvetica')
           .text('Contact: +92 300 1234567 | Email: info@travellers.com', { align: 'center' })
           .text('Website: www.travellers.com', { align: 'center' })
           .moveDown();
        doc.fontSize(8)
           .font('Helvetica-Oblique')
           .text('This is a computer-generated document and does not require a signature.', { align: 'center' });

        doc.end();

        stream.on('finish', () => {
          resolve({
            transcriptNumber,
            fileName,
            filePath,
            transcriptData: {
              tourDetails: {
                tourType: trip.tourType,
                date: trip.date,
                time: trip.time,
                passengers: trip.passengers,
                totalAmount: trip.totalAmount,
                status: trip.status,
                paymentStatus: trip.paymentStatus,
                paymentMethod: 'Stripe (Visa/Mastercard)',
                message: trip.message || ''
              },
              userDetails: {
                username: user.username,
                email: user.email,
                phone: user.phone
              },
              generatedAt: new Date()
            }
          });
        });

        stream.on('error', (error) => {
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = PDFGenerator; 