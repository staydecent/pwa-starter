import React from 'react'

const isReactNative = window.navigator.product === 'ReactNative'

// children can be an array or object in React,
// but always array in Preact.
const compatMap = React.Children
  ? React.Children.map
  : (ls, fn) => Array.prototype.map.call(ls, fn)

// React method to skip textNodes, and Preact fallback.
const compatIsValid = React.isValidElement
  ? React.isValidElement
  : child => child.nodeName != null

// These are the component names that we will sync values
// to our parent Form state.
// @TODO: This should be props passed into <Form />
const formFieldNames = [
  // Our ReactNative 'form' components
  'InputIcon',

  // Our web form field components
  'TextInput'
]

const getNodeName = child =>
  child.type ? child.type.displayName : child.nodeName.name

const getProps = child => child.attributes || child.props || {}

// Is one of the above defined form fields, and has a `name`
// prop set. We can't sync state if the component doesn't have
// have a `name` prop set.
const isFormField = child =>
  formFieldNames.includes(getNodeName(child)) &&
  getProps(child).name != null

// Our actual Form components
export default class Form extends React.Component {
  constructor (props) {
    super(props)
    if (!this.props.name) throw new Error('<Form /> Components needs a `name` prop.')
    this.state = {
      values: {},
      errors: {}
    }
    this._fields = {}
  }

  _updateChildFormFields (children, formName) {
    return compatMap(children, child => {
      if (!compatIsValid(child)) {
        return child
      }

      const childProps = child.attributes || child.props
      if (childProps.isSubmit) {
        // if has isSubmit flag, treat as Submit button on ReactNative
        child = React.cloneElement(child, {formName, onPress: () => this._onSubmit()})
      } else if (isFormField(child)) {
        // If one of our nested Form Fields, add syncState prop.
        // If not ReactNative, override the onChange event to sync value.
        child = React.cloneElement(child, {
          formName,
          syncState: state => this.setState({values: {
            ...this.state.values,
            [childProps.name]: state.value || state.text
          }}),
          ...!isReactNative && {
            onChange: ev => this.setState({values: {
              ...this.state.values,
              [childProps.name]: ev.target.value
            }})
          }
        })
        // Store a reference to our fields, so we can validate them on submit
        this._fields[childProps.name] = child
      } else if (child.children || child.props.children) {
        // Recursively search children for more form fields
        child = React.cloneElement(child, {
          formName,
          children: this._updateChildFormFields(
            child.children || child.props.children,
            formName
          )
        })
      }

      return child
    })
  }

  _onSubmit (ev) {
    ev && ev.preventDefault()
    const fieldNames = Object.keys(this._fields)
    // @TODO: More validations, allow props to set them, etc.
    const errors = fieldNames.reduce((errs, name) => {
      const comp = this._fields[name]
      if (getProps(comp).required && !this.state.values[name]) {
        errs[name] = 'Is required.'
      }
      return errs
    }, {})
    const hasError = Object.keys(errors).length > 0
    hasError && this.setState({errors: {...this.state.errors, ...errors}})
    this.props.onSubmit && this.props.onSubmit({
      hasError,
      errors: errors,
      data: this.state.values
    })
  }

  render () {
    const children = this._updateChildFormFields(
      this.children || this.props.children,
      this.props.name
    )
    return isReactNative
      ? children
      : <form
        id={`Form-${this.props.name}`}
        key={this.props.name}
        onSubmit={this._onSubmit.bind(this)}
      >
        {children}
      </form>
  }
}
