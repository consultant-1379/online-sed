import { expect } from "vitest";
import { mount } from '@vue/test-utils';
import ObjectArray from '../../src/components/ObjectArray.vue';
import model from "../../src/model/index.js";


describe('ObjectArray', () => {
  beforeEach(() => {
    model = {};
    model.currentQuestion = {
      key: "backup_scheduling_schedules",
      objectArrayInfo: {
        every: {
          required: true,
          type: "string",
          validationPattern: "^(\\d+w)?(\\d+d)?(\\d+h)?(\\d+m)?$",
          preventDuplicates: true
        },
        start: {
          required: false,
          type: "datetime-local",
          validationPattern: "^[0-9]{1,4}\\-[0-9]{1,2}\\-[0-9]{1,2}T[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}$",
          preventDuplicates: false
        },
        stop: {
          required: false,
          type: "datetime-local",
          validationPattern: "^[0-9]{1,4}\\-[0-9]{1,2}\\-[0-9]{1,2}T[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}$",
          preventDuplicates: false
        }
      }
    }
    model.selectedUseCase = {
      "name": "Install"
    };
    model.response = {};
    model.showObjectDialog = true;
    model.initializedObjectArrayInputSelects = [];
  });

  it('renders no record message when objectData is empty', () => {
    const wrapper = mount(ObjectArray, {
      data() {
        return {
          objectData: [],
        };
      }
    });
    expect(wrapper.find('#noRec').exists()).to.be.true;
  });

  it('renders table when objectData is not empty', async () => {
    const wrapper = mount(ObjectArray, {
      data() {
        return {
          objectData: [{ key: 'value' }],
          model
        };
      },
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('#objectArrayTable').exists()).to.be.true;
  });

  it('adds a new row when addRow is called', async () => {
    const wrapper = mount(ObjectArray, {
      data() {
        return {
          objectData: [],
          model
        };
      },
    });
    await wrapper.vm.addRow();
    expect(wrapper.vm.objectData.length).to.equal(1);
  });

  it('adds a new row fails when current entry is not fully populated', async () => {
    const wrapper = mount(ObjectArray, {
      data() {
        return {
          objectData: [],
          model
        };
      },
    });
    await wrapper.vm.addRow();
    expect(wrapper.vm.objectData.length).to.equal(1);
    await wrapper.vm.addRow();
    expect(wrapper.vm.objectData.length).to.equal(1);
  });

  it('calls deleteRow method when delete button is clicked', () => {
    const wrapper = mount(ObjectArray, {
      data() {
        return {
          objectData: [{ index: 1 }, { index: 2 }],
          model
        };
      }
    });
    const deleteButton = wrapper.find('#delete-object-array-1');
    deleteButton.trigger('click');
    expect(wrapper.vm.objectData.length).to.equal(1); // Check if one row is deleted
  });

  it('saves data all entries are valid', async () => {
    const wrapper = mount(ObjectArray, {
      data() {
        return {
          objectData: [
            {
              every: "1w"
            }
          ],
          model
        };
      },
    });
    await wrapper.vm.save();
    expect(wrapper.vm.objectData.length).to.equal(1);
    expect(model.showObjectDialog).to.be.false;
  });

  it('saves data fails if all entries are not valid', async () => {
    const wrapper = mount(ObjectArray, {
      data() {
        return {
          objectData: [
            {
              every: "1q"
            }
          ],
          model
        };
      },
    });
    await wrapper.vm.save();
    expect(wrapper.vm.objectData.length).to.equal(1);
    expect(model.showObjectDialog).to.be.true;
  });

  it('updates handleLocalDataChanges called correctly', () => {
    model.currentQuestion = {
      key: "backup_scheduling_schedules",
      objectArrayInfo: {
        every: {
          required: true,
          type: "select",
          options: ['1w', '5w'],
          preventDuplicates: true
        },
      }
    }
    const wrapper = mount(ObjectArray, {
      data() {
        return {
          objectData: [{}],
          model
        };
      },
    });
    const select = {value: ['5w']};
    const selectDOM = {id: 'objectArray-select--every--0'};
    wrapper.vm.handleLocalDataChanges(select, selectDOM);
    expect(wrapper.vm.objectData).to.deep.equal([{ every: "5w"}]);
  });

  it('duplicate error displayed', async () => {
    model.currentQuestion = {
      key: "backup_scheduling_schedules",
      objectArrayInfo: {
        every: {
          required: true,
          type: "string",
          preventDuplicates: true
        },
      }
    }
    const wrapper = mount(ObjectArray, {
      data() {
        return {
          objectData: [{every: "1w"}, {every: "1w"}],
          model
        };
      },
    });
    await wrapper.vm.$nextTick();
    const errorMessage = wrapper.find('.validation-error-message');
    expect(errorMessage.exists()).to.be.true;
    expect(errorMessage.text()).to.equal('Duplicate entry');
  });

  it('duplicate error not displayed if preventDuplicates is false', async () => {
    model.currentQuestion = {
      key: "backup_scheduling_schedules",
      objectArrayInfo: {
        every: {
          required: true,
          type: "string",
          preventDuplicates: false
        },
      }
    }
    const wrapper = mount(ObjectArray, {
      data() {
        return {
          objectData: [{every: "1w"}, {every: "1w"}],
          model
        };
      },
    });
    await wrapper.vm.$nextTick();
    const errorMessage = wrapper.find('.validation-error-message');
    expect(errorMessage.exists()).to.be.false;
  });

  it('already present values are displayed', async () => {
    model.currentQuestion = {
      key: "backup_scheduling_schedules",
      objectArrayInfo: {
        every: {
          required: true,
          type: "string",
          preventDuplicates: false
        },
      }
    }
    model.response.backup_scheduling_schedules = [{every: '1w'}, {every: '2w'}, {every: '8h'}]
    const wrapper = mount(ObjectArray, {
      data() {
        return {
          objectData: [],
          model
        };
      },
    });
    await expect(wrapper.vm.objectData).to.deep.equal([{every: '1w'}, {every: '2w'}, {every: '8h'}]);
  });

  it('updateDate updates the date to the ISO format', async () => {
    const wrapper = mount(ObjectArray, {
      data() {
        return {
          objectData: [{start: ""}],
          model
        };
      },
    });
    const evt = {
      target: {
        value: '2024-03-29T13:57'
      }
    }
    await wrapper.vm.updateDate(evt, "start", 0);
    expect(wrapper.vm.objectData[0].start).to.equal('2024-03-29T13:57:00');
  });
});

describe('ObjectArray labels', () => {
  beforeEach(() => {
    model = {};
    model.currentQuestion = {
      key: "pm_server_external_remote_write_relabel_configs",
      objectArrayInfo: {
        source_label: {
          type: "array",
          validationPattern: "^(\\d+w)?(\\d+d)?(\\d+h)?(\\d+m)?$",
        }
      }
    }
    model.selectedUseCase = {
      "name": "Install"
    };
    model.response = {};
    model.showObjectDialog = true;
    model.initializedObjectArrayInputSelects = [];
  });

 it('save button updates data that is a string to an array when type = array', async () => {
    const wrapper = mount(ObjectArray, {
     data() {
        return {
          objectData: [
            {
             source_label: "1w"
            }
          ],
          model
        };
      },
    });
    await wrapper.vm.save();
    expect(model.response.pm_server_external_remote_write_relabel_configs).to.deep.equal([{ source_label: ['1w'] }]);
  });

 it('saves array when type is an array', async () => {
    const wrapper = mount(ObjectArray, {
     data() {
        return {
          objectData: [
            {
             source_label: ["1w"]
            }
          ],
          model
        };
      },
    });
    await wrapper.vm.save();
    expect(model.response.pm_server_external_remote_write_relabel_configs).to.deep.equal([{ source_label: ['1w'] }]);
  });
});
