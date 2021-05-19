import Svelecte, { addFormatter, config } from 'svelecte';

export { addFormatter, config };

const OPTION_LIST = [
  'options', 'fetch', 'name', 'required', 'value',
  'multiple','disabled', 'max', 'creatable', 'delimiter',
  'placeholder', 'renderer', 'searchable', 'clearable', 'fetch', 'value-field', 'label-field', 'label-as-value',
  'virtual-list', 'lazy'
];

function formatValue(name, value) {
  switch (name) {
    case 'options':
      if (Array.isArray(value)) return value;
      try {
        value = JSON.parse(value);
        if (!Array.isArray(value)) {
          value = [];
        }
      } catch (e) {
        value = [];
      }
      return value;
    case 'value':
      return value ? value.split(',').map(item => {
        const _v = parseInt(item);
        return isNaN(_v) ? item : _v;
      }) : '';
    case 'renderer':
      return value || 'default';
    case 'searchable':
      return value == 'true';
    case 'clearable':
      return value != 'false';
    case 'required':
    case 'virtual-list':
    case 'label-as-value':
    case 'multiple':
    case 'creatable':
    case 'selectOnTab':
    case 'lazy':
    case 'disabled':
      return value !== null;
    case 'max':
      return isNaN(parseInt(value)) ? 0 : parseInt(value);
  }
  return value;
}

function formatProp(name) {
  switch (name) {
    case 'virtual-list': return 'virtualList';
    case 'value-field': return 'valueField';
    case 'label-field': return 'labelField';
    case 'label-as-value': return 'labelAsValue';
    case 'lazy': return 'lazyDropdown';
  }
  return name;
}

/**
 * Connect Custom Component attributes to Svelte Component properties
 * @param {string} name Name of the Custom Component
 */
class SvelecteElement extends HTMLElement {
  constructor() {
    super();
    this.svelecte = undefined;
    this.anchorSelect = null;
    this._fetchOpts = null;
    
    /** ************************************ public API */
    this.setOptions = options => this.svelecte.setOptions(options);
    Object.defineProperties(this, {
      'selection': {
        get() {
          return this.svelecte
            ? this.svelecte.getSelection()
            : null;
        }
      },
      'value': {
        get() {
          return this.svelecte
            ? this.svelecte.getSelection(true)
            : null;
        },
        set(value) {
          this.setAttribute('value', Array.isArray(value) ? value.join(',') : value);
        }
      },
      'options': {
        get() {
          return this.hasAttribute('options')
            ? JSON.parse(this.getAttribute('options'))
            : (this._fetchOpts || []);
        },
        set(value) {
          this.setAttribute('options', Array.isArray(value) ? JSON.stringify(value) : value);
        }
      },
      'disabled': {
        get() {
          return this.getAttribute('disabled') !== null;
        },
        set(value) {
          if (!value) { 
            this.removeAttribute('disabled');
          } else {
            this.setAttribute('disabled', value === true ? '' : value);
          }
        }
      },
      'multiple': {
        get() {
          return this.getAttribute('multiple') !== null;
        },
        set(value) {
          if (!value) { 
            this.removeAttribute('multiple');
          } else {
            this.setAttribute('multiple', value === true ? '' : value);
          }
        }
      },
      'creatable': {
        get() {
          return this.getAttribute('creatable') !== null;
        },
        set(value) {
          if (!value) { 
            this.removeAttribute('creatable');
          } else {
            this.setAttribute('creatable', value === true ? '' : value);
          }
        }
      },
      'clearable': {
        get() {
          return this.getAttribute('clearable') !== 'false';
        },
        set(value) {
          this.setAttribute('clearable', value ? 'true' : 'false');
        }
      },
      'placeholder': {
        get() {
          return this.getAttribute('placeholder') || '';
        },
        set(value) {
          this.setAttribute('placeholder', value || 'Select');
        }
      },
      'renderer': {
        get() {
          return this.getAttribute('renderer') || 'default';
        },
        set(value) {
          value && this.setAttribute('renderer', value);
        }
      },
      'required': {
        get() {
          return this.hasAttribute('required');
        },
        set(value) {
          if (!value && value !== '') {
            this.removeAttribute('required');
          } else {
            this.setAttribute('required', '');
          }
        }
      },
      'hasAnchor': {
        get() {
          return this.anchorSelect ? true : false;
        }
      },
      'max': {
        get() {
          return this.getAttribute('max') || 0;
        },
        set(value) {
          try {
            value = parseInt(value);
            if (value < 0) value = 0;
          } catch (e) {
            value = 0;
          }
          this.setAttribute('max', value);
        }
      },
      'delimiter': {
        get() {
          return this.getAttribute('delimiter') || ',';
        },
        set(value) {
          this.setAttribute('delimiter', value);
        }
      },
      'valueField': {
        get() {
          return this.getAttribute('value-field') || '';
        },
        set(value) {
          this.setAttribute('value-field', value);
        }
      },
      'labelField': {
        get() {
          return this.getAttribute('labelField') || '';
        },
        set(value) {
          this.setAttribute('labelField', value);
        }
      },
      'virtualList': {
        get() {
          return this.hasAttribute('virtual-list');
        },
        set(value) {
          if (!value && value !== '') {
            this.removeAttribute('virtual-list');
          } else {
            this.setAttribute('virtual-list', '');
          }
        }
      },
      'labelAsValue': {
        get() {
          return this.hasAttribute('label-as-value');
        },
        set(value) {
          if (!value && value !== '') {
            this.removeAttribute('label-as-value');
          } else {
            this.setAttribute('label-as-value', '');
          }
        }
      },
      'lazy': {
        get() {
          return this.hasAttribute('lazy')
            ? true
            : config.lazyDropdown;
        },
        set(value) {
          console.log('⚠ this setter has no effect after component has been created')
        }
      },
      'form': {
        get() {
          return this.closest('form');
        }
      }
    });
  }

  focus() {
    !this.disabled && this.querySelector('input').focus();
  }

  static get observedAttributes() {
    return OPTION_LIST;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (this.svelecte && oldValue !== newValue) {
      name === 'value'
        ? this.svelecte.setSelection(formatValue(name, newValue))
        : this.svelecte.$set({ [formatProp(name)]: formatValue(name, newValue) });
    }
  }

  connectedCallback() {
    setTimeout(() => { this.render() });
  }

  render() {
    if (this.svelecte) return;
    let props = {};
    for (const attr of OPTION_LIST) {
      if (this.hasAttribute(attr)) {
        props[formatProp(attr)] = formatValue(attr, this.getAttribute(attr));
      }
    }
    if (this.hasAttribute('class')) {
      props.class = this.getAttribute('class');
    }
    if (this.hasAttribute('parent')) {
      delete props['fetch'];
      props.disabled = true;
      this.parent = document.getElementById(this.getAttribute('parent'));
      if (!this.parent.value && this.svelecte) {
        return;
      };
      this.parentCallback = e => {
        if (!e.target.selection || (Array.isArray(e.target.selection) && !e.target.selection.length)) {
          this.svelecte.clearByParent(true);
          return;
        }
        !this.parent.disabled && this.removeAttribute('disabled');
        if (this.hasAttribute('fetch')) {
          this.svelecte.clearByParent(true);
          const fetchUrl = this.getAttribute('fetch').replace('[parent]', e.target.value);
          this.svelecte.$set({ fetch: fetchUrl, disabled: false });
        }
      };
      this.parent.addEventListener('change', this.parentCallback);
    }
    const anchorSelect = this.querySelector('select');
    if (anchorSelect) {
      props['hasAnchor'] = true;
      anchorSelect.style = 'opacity: 0; position: absolute; z-index: -2; top: 0; height: 38px';
      anchorSelect.tabIndex = -1; // just to be sure
      this.anchorSelect = anchorSelect;
      this.anchorSelect.name = props.name;
      this.anchorSelect.multiple = props.multiple || props.name.includes('[]');
      (Array.isArray(props.value) ? props.value : [props.value]).forEach(val => {
        this.anchorSelect.innerHTML += `<option value="${val}" selected>${val}</option>`;
      });
    }
    this.svelecte = new Svelecte({
      target: this,
      anchor: anchorSelect,
      props,
    }); 
    this.svelecte.$on('change', e => {
      const value = this.svelecte.getSelection(true);
      this.setAttribute('value', Array.isArray(value) ? value.join(',') : value);
      this.dispatchEvent(e);
      // Custom-element related
      if (this.anchorSelect) {
        this.anchorSelect.innerHTML = (Array.isArray(value) ? (value.length ? value : [null]) : [value]).reduce((res, item) => {
          if (!item) {
            res+= '<option value="" selected="">Empty</option>';
            return res;
          }
          res+= `<option value="${item}" selected>${item}</option>`;
          return res;
        }, '');
        this.anchorSelect.dispatchEvent(new Event('change'));
      }
    });
    this.svelecte.$on('fetch', e => {
      this._fetchOpts = e.detail;
      this.dispatchEvent(e);
    });
    return true;
  }

  disconnectedCallback() {
    this.svelecte && this.svelecte.$destroy();
    this.parent && this.parent.removeEventListener('change', this.parentCallback);
  }
}

export function registerSvelecte(name) {
  window.customElements.define(name || 'el-svelecte', SvelecteElement);
}
