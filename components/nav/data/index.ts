import { accessNav } from '@/components/nav/data/access.nav';
import { extraNav } from '@/components/nav/data/extra.nav';
import { geoNav } from '@/components/nav/data/geo.nav';
import { mainNav } from '@/components/nav/data/main.nav';
import { propertyNav } from '@/components/nav/data/property.nav';
import { NavGroup } from '@/components/nav/interfaces/nav.interface';

export const navRouteGroups: NavGroup[] = [mainNav, propertyNav, extraNav, geoNav, accessNav];
