import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PageRole } from '@/types/user.type';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(
  bytes: number,
  opts: {
    decimals?: number;
    sizeType?: 'accurate' | 'normal';
  } = {}
) {
  const { decimals = 0, sizeType = 'normal' } = opts;

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const accurateSizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'];
  if (bytes === 0) return '0 Byte';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${
    sizeType === 'accurate'
      ? (accurateSizes[i] ?? 'Bytest')
      : (sizes[i] ?? 'Bytes')
  }`;
}

export function arrayToTree(flatArray: PageRole[]): PageRole[] {
  // Tạo Map để tra cứu nhanh các node theo id
  const nodeMap = new Map<number, PageRole>();
  const result: PageRole[] = [];

  // Khởi tạo tất cả nodes và thêm vào Map
  flatArray.forEach((item) => {
    const node: PageRole = { ...item, children: [] };
    nodeMap.set(item.id, node);
  });

  // Xây dựng cấu trúc tree
  flatArray.forEach((item) => {
    const node = nodeMap.get(item.id)!;

    if (item.parentId === 0) {
      // Node gốc (parentId = 0)
      result.push(node);
    } else {
      // Node con - thêm vào children của parent
      const parent = nodeMap.get(item.parentId);
      if (parent) {
        parent.children!.push(node);
      }
    }
  });

  // Sắp xếp theo menuIndex ở mỗi cấp
  const sortByMenuIndex = (nodes: PageRole[]) => {
    nodes.sort((a, b) => a.menuIndex - b.menuIndex);
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        sortByMenuIndex(node.children);
      }
    });
  };

  sortByMenuIndex(result);
  return result;
}

export function formatSort(
  sorting: { id: string; desc: boolean }[] | null | undefined
): string[] | undefined {
  if (!sorting || sorting.length === 0) return undefined;
  return sorting.map((s) => `${s.id},${s.desc ? 'desc' : 'asc'}`);
}
