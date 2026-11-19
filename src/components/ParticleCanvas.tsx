import React, { useEffect, useRef } from 'react';
import './ParticleCanvas.css';

interface ParticleCanvasProps {
  className?: string;
  theme?: 'light' | 'dark';
  maxParticles?: number;
}

const random = (min: number, max: number, float = false) => {
  const val = Math.random() * (max - min) + min;
  return float ? val : Math.floor(val);
};

const sample = <T,>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

class Particle {
  private canvas: HTMLCanvasElement;
  public type: 'bubble' | 'line';
  public x: number;
  public y: number;
  public radius: number;
  public color: string;
  private speedX: number;
  private speedY: number;
  private angle: number;
  private spinSpeed: number;
  private length: number;

  constructor(canvas: HTMLCanvasElement, colors: string[]) {
    this.canvas = canvas;
    this.type = random(0, 2) === 0 ? 'bubble' : 'line';
    this.x = random(0, this.canvas.width);
    this.y = random(0, this.canvas.height);
    this.radius = random(1, 4);
    this.color = sample(colors);
    this.speedX = random(-0.5, 0.5, true);
    this.speedY = random(-0.5, 0.5, true);
    this.angle = random(0, 360);
    this.spinSpeed = random(-2, 2, true);
    this.length = random(5, 15);
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.type === 'line') {
      this.angle += this.spinSpeed;
    }

    // Reset position if it moves out of bounds
    if (
      this.x < -20 ||
      this.x > this.canvas.width + 20 ||
      this.y < -20 ||
      this.y > this.canvas.height + 20
    ) {
      this.x = random(0, this.canvas.width);
      this.y = random(0, this.canvas.height);
    }
  }

  draw(context: CanvasRenderingContext2D) {
    context.save();
    context.beginPath();
    context.strokeStyle = this.color;
    context.fillStyle = this.color;

    if (this.type === 'bubble') {
      context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      context.fill();
    } else {
      context.translate(this.x, this.y);
      context.rotate((this.angle * Math.PI) / 180);
      context.moveTo(-this.length / 2, 0);
      context.lineTo(this.length / 2, 0);
      context.stroke();
    }

    context.restore();
  }
}

export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({
  className,
  theme = 'dark',
  maxParticles = 80
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Define colors based on the theme (translucent for soft backdrop blend)
    const colors =
      theme === 'dark'
        ? [
            'rgba(246, 248, 250, 0.15)', // light grey/white
            'rgba(0, 188, 212, 0.15)',  // cyan
            'rgba(255, 64, 129, 0.15)',  // neon pink
            'rgba(63, 81, 181, 0.15)'   // indigo
          ]
        : [
            'rgba(23, 24, 28, 0.08)',   // dark grey
            'rgba(0, 188, 212, 0.1)',   // cyan
            'rgba(255, 64, 129, 0.1)',   // neon pink
            'rgba(63, 81, 181, 0.1)'    // indigo
          ];

    const particles: Particle[] = [];

    const updateCanvasSize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Generate particles
    for (let i = 0; i < maxParticles; i++) {
      particles.push(new Particle(canvas, colors));
    }

    let animationFrameId: number;

    const animate = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle) => {
        particle.update();
        particle.draw(context);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, maxParticles]);

  return (
    <canvas
      ref={canvasRef}
      className={`particle-canvas ${className ?? ''}`}
    />
  );
};
