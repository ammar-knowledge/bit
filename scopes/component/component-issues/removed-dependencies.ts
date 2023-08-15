import { ComponentIssue, ISSUE_FORMAT_SPACE } from './component-issue';

export class RemovedDependencies extends ComponentIssue {
  description = 'removed dependencies';
  solution =
    'edit the code to remove references to the dependency. alternatively, if on lane, bit-install the component to get it from main';
  data: string[]; // deps ids
  isTagBlocker = true;
  dataToString() {
    return ISSUE_FORMAT_SPACE + this.data.join(', ');
  }
}
