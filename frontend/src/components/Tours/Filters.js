import React from 'react';
import {Col, FormGroup, Row} from "react-bootstrap";
import {Location} from "./FilterInputs/Location";

import DatePicker from "react-16-bootstrap-date-picker";
import {ActivityType} from "./FilterInputs/ActivityType";
import {Difficulty} from "./FilterInputs/Difficulty";
import {GuideType} from "./FilterInputs/GuideType";
import {Price} from "./FilterInputs/Price";
import {compose, withHandlers} from "recompose";
import PropTypes from 'prop-types';


export const Filters = compose(
    withHandlers(
        {
            onChange: props => property => val => props.onChange({...props.value, [property]: val})
        }
    ))(props =>
    <div className="filters-wrapper">
        <Row>
            <Col md={6}>
                <Location onValueChange={props.onChange('locationName')}
                          onLatLngChange={props.onChange('locationLatLng')}
                          value={props.value.locationName}

                />
            </Col>
            <Col md={3} sm={6}>
                <FormGroup
                    controlId="dateFrom">
                    <DatePicker
                        onChange={props.onChange('dateAfter')}
                        value={props.value.dateAfter}
                        placeholder="Date from"
                    />
                </FormGroup>
            </Col>
            <Col md={3} sm={6}>
                <FormGroup
                    controlId="dateTo">
                    <DatePicker
                        onChange={props.onChange('dateBefore')}
                        value={props.value.dateBefore}
                        placeholder="Date to"
                    />
                </FormGroup>
            </Col>
        </Row>
        <Row>
            <Col md={3}>
                <ActivityType onChange={props.onChange('activityTypes')}
                              value={props.value.activityTypes}/>
            </Col>
            <Col md={3}>
                <Difficulty onChange={props.onChange('difficulties')}
                            value={props.value.difficulties}/>
            </Col>
            <Col md={3}>
                <GuideType onChange={props.onChange('guideTypes')}
                           value={props.value.guideTypes}/>
            </Col>
            <Col md={3}>
                <Price onChange={props.onChange('price')}
                       value={props.value.price}/>
            </Col>
        </Row>
    </div>
);

Filters.propTypes = {
    onChange: PropTypes.func.isRequired,
    onLoadingShouldStart: PropTypes.func,

    value: PropTypes.shape({
        locationName: PropTypes.string.isRequired,
        locationLatLng: PropTypes.array.isRequired,
        activityTypes: PropTypes.array.isRequired,
        difficulties: PropTypes.array.isRequired,
        guideTypes: PropTypes.array.isRequired,
        price: PropTypes.array.isRequired
    })
};