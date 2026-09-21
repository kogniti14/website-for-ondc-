import { Testimonial } from '../types';
import { dataSyncBus } from './dataSyncBus';

const LOCAL_STORAGE_KEY = 'km_testimonials_v1';

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 'testi_01_malhotra',
    name: 'Vikram Malhotra',
    role: 'Head of Procurement',
    designation: 'Head of Procurement',
    company: 'EduTech Solutions Pvt Ltd',
    organization: 'EduTech Solutions Pvt Ltd',
    text: 'We transitioned all 5 campuses of our university to Kogniti 75 GSM agro-waste copier paper. Jam-free high-speed printing during semester exams, prompt GST billing, and real carbon reduction for our annual sustainability report.',
    rating: 5,
    status: 'published',
    isFeatured: true,
    displayOrder: 1,
    createdAt: '2026-08-10T10:00:00Z',
    updatedAt: '2026-08-10T10:00:00Z',
  },
  {
    id: 'testi_02_kulkarni',
    name: 'Ananya Kulkarni',
    role: 'Lead Software Architect',
    designation: 'Lead Software Architect',
    company: 'TechInnovate, Bengaluru',
    organization: 'TechInnovate, Bengaluru',
    text: 'The AgroLeaf executive notebooks and plantable seed pens are phenomenal. The 80 GSM tree-free paper has an incredible natural texture with zero bleed from fountain pens. Quick delivery to our Bengaluru office.',
    rating: 5,
    status: 'published',
    isFeatured: true,
    displayOrder: 2,
    createdAt: '2026-08-18T14:30:00Z',
    updatedAt: '2026-08-18T14:30:00Z',
  },
  {
    id: 'testi_03_verma',
    name: 'Pooja Verma',
    role: 'Director of Workplace Experience',
    designation: 'Director of Workplace Experience',
    company: 'Innovate Hub',
    organization: 'Innovate Hub',
    text: 'We ordered 500 custom-embossed Agro-Paper employee onboarding hampers for our corporate annual meet. Our team loved the plantable seed pencils and handcrafted journals. Outstanding B2B support!',
    rating: 5,
    status: 'published',
    isFeatured: true,
    displayOrder: 3,
    createdAt: '2026-08-25T11:15:00Z',
    updatedAt: '2026-08-25T11:15:00Z',
  },
  {
    id: 'testi_04_sengupta',
    name: 'Rajesh Sengupta',
    role: 'Supply Chain Director',
    designation: 'Supply Chain Director',
    company: 'OmniRetail Logistics Network',
    organization: 'OmniRetail Logistics Network',
    text: 'Switching our regional dispatch hubs to Kogniti Minds biodegradable tamper-evident agro-paper mailers reduced our single-use plastic consumption to zero without compromising burst strength or security.',
    rating: 5,
    status: 'published',
    isFeatured: true,
    displayOrder: 4,
    createdAt: '2026-09-02T16:20:00Z',
    updatedAt: '2026-09-02T16:20:00Z',
  },
  {
    id: 'testi_05_srivastava',
    name: 'Dr. Neha Srivastava',
    role: 'Dean of Academic Affairs',
    designation: 'Dean of Academic Affairs',
    company: "St. Xavier's Academic Trust",
    organization: "St. Xavier's Academic Trust",
    text: 'High opacity, pristine finish, and complete absence of chlorine bleaching. Our examination cell processed over 150,000 answer sheets with zero printer jams. Truly future-ready sustainable paper.',
    rating: 5,
    status: 'published',
    isFeatured: true,
    displayOrder: 5,
    createdAt: '2026-09-09T09:45:00Z',
    updatedAt: '2026-09-09T09:45:00Z',
  },
];

class TestimonialService {
  private memoryTestimonials: Testimonial[] | null = null;
  private isHydrated = false;

  constructor() {
    if (typeof window !== 'undefined') {
      setTimeout(() => this.hydrateFromServer(), 50);
    }
  }

  private async syncServer(payload: unknown, method: 'POST' | 'DELETE' = 'POST', id?: string): Promise<unknown> {
    if (typeof window === 'undefined') return null;
    const isBatch = Array.isArray(payload);
    const body = method !== 'DELETE' ? JSON.stringify(payload) : undefined;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    };

    try {
      const phpUrl =
        method === 'DELETE' && id
          ? `/api/data.php?collection=testimonials&id=${encodeURIComponent(id)}`
          : `/api/data.php?collection=testimonials${isBatch ? '&batch=true' : ''}`;
      let res = await fetch(phpUrl, { method, headers, body, cache: 'no-store' }).catch(() => null);
      if (!res || !res.ok) {
        const url =
          method === 'DELETE' && id
            ? `/api/data/testimonials/${encodeURIComponent(id)}`
            : `/api/data/testimonials${isBatch ? '?batch=true' : ''}`;
        res = await fetch(url, { method, headers, body, cache: 'no-store' }).catch(() => null);
      }
      if (res && res.ok) {
        return await res.json().catch(() => null);
      }
    } catch (e) {
      void e;
    }
    return null;
  }

  public async hydrateFromServer(): Promise<Testimonial[]> {
    if (typeof window === 'undefined') return INITIAL_TESTIMONIALS;
    try {
      let serverData: Testimonial[] | null = null;
      const res = await fetch('/api/data.php?collection=testimonials', { cache: 'no-store' }).catch(() => null);
      if (res && res.ok) {
        serverData = await res.json().catch(() => null);
      }
      if (!serverData || !Array.isArray(serverData) || serverData.length === 0) {
        const fallbackRes = await fetch('/api/data/testimonials', { cache: 'no-store' }).catch(() => null);
        if (fallbackRes && fallbackRes.ok) {
          serverData = await fallbackRes.json().catch(() => null);
        }
      }

      if (serverData && Array.isArray(serverData) && serverData.length > 0) {
        this.memoryTestimonials = serverData;
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serverData));
        this.isHydrated = true;
        dataSyncBus.emit('testimonials', this.memoryTestimonials);
        return serverData;
      }
    } catch (e) {
      void e;
    }

    const local = this.getAllTestimonials();
    this.isHydrated = true;
    return local;
  }

  public getAllTestimonials(): Testimonial[] {
    if (this.memoryTestimonials) {
      return [...this.memoryTestimonials].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    }
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.memoryTestimonials = parsed;
            return [...parsed].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          }
        }
      } catch (e) {
        void e;
      }
    }
    this.memoryTestimonials = [...INITIAL_TESTIMONIALS];
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_TESTIMONIALS));
      } catch (e) {
        void e;
      }
    }
    return [...INITIAL_TESTIMONIALS];
  }

  public getTestimonials(options?: { onlyPublished?: boolean }): Testimonial[] {
    const list = this.getAllTestimonials();
    if (options?.onlyPublished !== false) {
      return list.filter((t) => t.status === 'published');
    }
    return list;
  }

  public getTestimonialById(id: string): Testimonial | undefined {
    return this.getAllTestimonials().find((t) => t.id === id);
  }

  public async saveTestimonial(input: Partial<Testimonial> & { name: string; text: string }): Promise<Testimonial> {
    const all = this.getAllTestimonials();
    const now = new Date().toISOString();
    let updatedItem: Testimonial;

    if (input.id) {
      const idx = all.findIndex((t) => t.id === input.id);
      if (idx !== -1) {
        updatedItem = {
          ...all[idx],
          ...input,
          updatedAt: now,
        };
        all[idx] = updatedItem;
      } else {
        updatedItem = {
          id: input.id,
          name: input.name.trim(),
          role: input.role || input.designation || '',
          designation: input.designation || input.role || '',
          company: input.company || input.organization || '',
          organization: input.organization || input.company || '',
          text: input.text.trim(),
          rating: input.rating !== undefined ? input.rating : 5,
          avatarUrl: input.avatarUrl || input.imageUrl || '',
          imageUrl: input.imageUrl || input.avatarUrl || '',
          status: input.status || 'published',
          isFeatured: input.isFeatured ?? true,
          displayOrder: input.displayOrder || all.length + 1,
          createdAt: input.createdAt || now,
          updatedAt: now,
        };
        all.push(updatedItem);
      }
    } else {
      const newId = `testi_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      updatedItem = {
        id: newId,
        name: input.name.trim(),
        role: input.role || input.designation || '',
        designation: input.designation || input.role || '',
        company: input.company || input.organization || '',
        organization: input.organization || input.company || '',
        text: input.text.trim(),
        rating: input.rating !== undefined ? input.rating : 5,
        avatarUrl: input.avatarUrl || input.imageUrl || '',
        imageUrl: input.imageUrl || input.avatarUrl || '',
        status: input.status || 'published',
        isFeatured: input.isFeatured ?? true,
        displayOrder: input.displayOrder || all.length + 1,
        createdAt: now,
        updatedAt: now,
      };
      all.push(updatedItem);
    }

    this.memoryTestimonials = all;
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(all));
    }
    dataSyncBus.emit('testimonials', all);
    await this.syncServer(all, 'POST');
    return updatedItem;
  }

  public async deleteTestimonial(id: string): Promise<boolean> {
    const all = this.getAllTestimonials();
    const filtered = all.filter((t) => t.id !== id);
    if (filtered.length === all.length) return false;

    this.memoryTestimonials = filtered;
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    }
    dataSyncBus.emit('testimonials', filtered);
    await this.syncServer(filtered, 'POST');
    return true;
  }

  public async reorderTestimonials(items: Testimonial[]): Promise<boolean> {
    const updated = items.map((item, index) => ({
      ...item,
      displayOrder: index + 1,
      updatedAt: new Date().toISOString(),
    }));

    this.memoryTestimonials = updated;
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }
    dataSyncBus.emit('testimonials', updated);
    await this.syncServer(updated, 'POST');
    return true;
  }
}

export const testimonialService = new TestimonialService();
