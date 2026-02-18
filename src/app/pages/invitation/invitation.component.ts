import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invitation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invitation.component.html',
  styleUrl: './invitation.component.css'
})
export class InvitationComponent implements AfterViewInit {
  @ViewChild('invitationCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private animationId: number = 0;
  private frameCount: number = 0;
  private recordedChunks: Blob[] = [];
  private mediaRecorder: MediaRecorder | null = null;
  isRecording: boolean = false;
  isDownloadReady: boolean = false;
  downloadUrl: string = '';

  ngAfterViewInit() {
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.canvas.width = 1920;
    this.canvas.height = 1080;
    this.startAnimation();
  }

  ngOnDestroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.downloadUrl) {
      URL.revokeObjectURL(this.downloadUrl);
    }
  }

  startAnimation() {
    this.animate();
  }

  animate() {
    this.drawFrame();
    this.frameCount++;
    
    // Loop the animation
    if (this.frameCount >= 300) {
      this.frameCount = 0;
    }
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  drawFrame() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // Background - Sleeping Beauty castle/sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#FFB6C1'); // Light pink
    gradient.addColorStop(0.5, '#DDA0DD'); // Plum
    gradient.addColorStop(1, '#9370DB'); // Medium purple
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add stars twinkling effect
    this.drawStars(ctx, width, height);

    // Draw decorative elements
    this.drawCastle(ctx, width, height);
    
    // Title with animation
    const titleY = 180 + Math.sin(this.frameCount * 0.05) * 10;
    ctx.font = 'bold 120px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFD700'; // Gold
    ctx.strokeStyle = '#FF69B4'; // Hot pink
    ctx.lineWidth = 4;
    ctx.strokeText('¡Estás Invitado!', width / 2, titleY);
    ctx.fillText('¡Estás Invitado!', width / 2, titleY);

    // Birthday child name
    ctx.font = 'bold 90px Georgia, serif';
    ctx.fillStyle = '#FFB6C1';
    ctx.strokeStyle = '#9370DB';
    ctx.lineWidth = 3;
    const nameY = 340;
    ctx.strokeText('Nelly Yunuen', width / 2, nameY);
    ctx.fillText('Nelly Yunuen', width / 2, nameY);

    // Age
    ctx.font = 'bold 100px Georgia, serif';
    ctx.fillStyle = '#FFD700';
    ctx.strokeStyle = '#FF69B4';
    const ageY = 470;
    ctx.strokeText('Cumple 3 años', width / 2, ageY);
    ctx.fillText('Cumple 3 años', width / 2, ageY);

    // Theme
    ctx.font = 'italic 70px Georgia, serif';
    ctx.fillStyle = '#FFF0F5'; // Lavender blush
    ctx.strokeStyle = '#9370DB';
    ctx.lineWidth = 2;
    const themeY = 570;
    ctx.strokeText('Tema: La Bella Durmiente', width / 2, themeY);
    ctx.fillText('Tema: La Bella Durmiente', width / 2, themeY);

    // Location with icon
    ctx.font = 'bold 60px Arial, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#9370DB';
    ctx.lineWidth = 2;
    const locationY = 700;
    ctx.strokeText('📍 Calle Revolución 44', width / 2, locationY);
    ctx.fillText('📍 Calle Revolución 44', width / 2, locationY);

    // Decorative elements
    this.drawRoses(ctx, width, height);
    this.drawSparkles(ctx, width, height);

    // Bottom message
    ctx.font = 'italic 50px Georgia, serif';
    ctx.fillStyle = '#FFD700';
    ctx.strokeStyle = '#FF69B4';
    ctx.lineWidth = 2;
    const msgY = 900;
    ctx.strokeText('¡No faltes a esta mágica celebración!', width / 2, msgY);
    ctx.fillText('¡No faltes a esta mágica celebración!', width / 2, msgY);
  }

  drawStars(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.fillStyle = '#FFFFE0';
    const starCount = 50;
    for (let i = 0; i < starCount; i++) {
      const x = (i * 137.5) % width;
      const y = (i * 234.7) % (height / 2);
      const size = 2 + ((this.frameCount + i * 10) % 30) / 10;
      const opacity = 0.3 + Math.sin((this.frameCount + i * 20) * 0.05) * 0.3;
      ctx.globalAlpha = opacity;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  drawCastle(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Simple castle silhouette at bottom
    ctx.fillStyle = 'rgba(138, 43, 226, 0.3)';
    ctx.fillRect(width / 2 - 150, height - 200, 100, 150);
    ctx.fillRect(width / 2 + 50, height - 200, 100, 150);
    
    // Towers
    ctx.beginPath();
    ctx.moveTo(width / 2 - 100, height - 200);
    ctx.lineTo(width / 2 - 125, height - 250);
    ctx.lineTo(width / 2 - 75, height - 250);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(width / 2 + 100, height - 200);
    ctx.lineTo(width / 2 + 75, height - 250);
    ctx.lineTo(width / 2 + 125, height - 250);
    ctx.closePath();
    ctx.fill();
  }

  drawRoses(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Decorative roses in corners
    const roses = [
      { x: 150, y: 150 },
      { x: width - 150, y: 150 },
      { x: 150, y: height - 150 },
      { x: width - 150, y: height - 150 }
    ];

    roses.forEach((rose, i) => {
      const rotation = (this.frameCount + i * 50) * 0.02;
      ctx.save();
      ctx.translate(rose.x, rose.y);
      ctx.rotate(rotation);
      
      // Simple rose
      ctx.fillStyle = '#FF69B4';
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#FFB6C1';
      ctx.beginPath();
      ctx.arc(-10, -10, 15, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    });
  }

  drawSparkles(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    
    for (let i = 0; i < 20; i++) {
      const x = (i * 387 + this.frameCount * 3) % width;
      const y = (i * 274 + this.frameCount * 2) % height;
      const size = 10 + Math.sin((this.frameCount + i * 30) * 0.1) * 5;
      
      ctx.globalAlpha = 0.5 + Math.sin((this.frameCount + i * 15) * 0.08) * 0.5;
      
      ctx.beginPath();
      ctx.moveTo(x - size, y);
      ctx.lineTo(x + size, y);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x, y + size);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  async recordVideo() {
    if (this.isRecording) return;

    this.isRecording = true;
    this.isDownloadReady = false;
    this.recordedChunks = [];

    try {
      const stream = this.canvas.captureStream(30); // 30 FPS
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 5000000
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        this.downloadUrl = URL.createObjectURL(blob);
        this.isDownloadReady = true;
        this.isRecording = false;
      };

      this.mediaRecorder.start();
      
      // Record for 10 seconds (300 frames at 30 FPS)
      setTimeout(() => {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
          this.mediaRecorder.stop();
        }
      }, 10000);

    } catch (error) {
      console.error('Error recording video:', error);
      this.isRecording = false;
      alert('Error al grabar el video. Por favor, intenta nuevamente.');
    }
  }

  downloadVideo() {
    if (!this.isDownloadReady || !this.downloadUrl) return;

    const a = document.createElement('a');
    a.href = this.downloadUrl;
    a.download = 'invitacion-nelly-yunuen-3-anos.webm';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
