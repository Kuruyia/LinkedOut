package com.linkedout.jobs.function.jobOffers

import com.linkedout.common.utils.RequestResponseFactory
import com.linkedout.common.utils.handleRequestError
import com.linkedout.jobs.converter.jobOffers.JobOfferWithJobAndCompanyToProto
import com.linkedout.jobs.service.JobOfferService
import com.linkedout.proto.RequestOuterClass.Request
import com.linkedout.proto.ResponseOuterClass.Response
import com.linkedout.proto.services.Jobs.GetMultipleJobOffersResponse
import org.springframework.stereotype.Component
import java.util.UUID
import java.util.function.Function

@Component
class GetMultipleJobOffers(private val jobOfferService: JobOfferService) : Function<Request, Response> {
    override fun apply(t: Request): Response = handleRequestError {
        // Extract the request
        val request = t.getMultipleJobOffersRequest
        val jobOfferIds = request
            .idsList
            .map(UUID::fromString)

        // Get the requested jobs from the database
        val reactiveResponse = jobOfferService.findMultipleWithJobAndCompanyAndApplicationStatus(jobOfferIds)
            .map { jobOffer ->
                JobOfferWithJobAndCompanyToProto().convert(jobOffer)
                    .setStatusValue(jobOffer.jobApplicationStatus)
            }
            .reduce(GetMultipleJobOffersResponse.newBuilder()) { builder, jobOffer ->
                builder.addJobOffers(jobOffer)
                builder
            }
            .map { builder ->
                builder.build()
            }

        // Block until the response is ready
        val response = reactiveResponse.block()
            ?: return RequestResponseFactory.newSuccessfulResponse()
                .setGetMultipleJobOffersResponse(GetMultipleJobOffersResponse.getDefaultInstance())
                .build()

        return RequestResponseFactory.newSuccessfulResponse()
            .setGetMultipleJobOffersResponse(response)
            .build()
    }
}
