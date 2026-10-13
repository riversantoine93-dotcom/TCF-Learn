import {expect,it} from 'vitest';
import {ORGANIZATION_COURSE_SLUGS,coursesForOrganizationRole} from '../lib/organization';
it('includes all thirty courses for future active learner seats',()=>{expect(ORGANIZATION_COURSE_SLUGS).toHaveLength(30);expect(coursesForOrganizationRole('learner',ORGANIZATION_COURSE_SLUGS)).toHaveLength(30)});
it('preserves administrator course entitlements while widening learner access',()=>{for(const role of ['admin','co_admin'] as const)expect(coursesForOrganizationRole(role,ORGANIZATION_COURSE_SLUGS)).toEqual(['turning-forward','thought-to-freedom'])});
